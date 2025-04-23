import requests 
import re
import json
from bs4 import BeautifulSoup 
from urllib.parse import urlparse, urlunparse, parse_qs, urlencode

class GoogleFormPrefiller:
    def __init__(self):
        """Initialize the GoogleFormPrefiller class."""
        self.form_url = None
        self.form_fields = None

    def expand_shortened_url(self, url):
        """Follows redirects to find the final Google Form URL."""
        try:
            response = requests.head(url, allow_redirects=True, timeout=10)
            response.raise_for_status()
            final_url = response.url
            if "docs.google.com/forms" in final_url:
                print(f"Expanded URL: {final_url}")
                return final_url
            else:
                print(f"Warning: Final URL doesn't look like a Google Form: {final_url}")
                return final_url
        except requests.exceptions.RequestException as e:
            print(f"Error expanding URL {url}: {e}")
            return None
        except Exception as e:
            print(f"An unexpected error occurred during URL expansion: {e}")
            return None

    def extract_form_fields_from_script(self, html_content):
        """
        Attempts to extract form fields from the embedded FB_PUBLIC_LOAD_DATA_ script.
        This is often more reliable than scraping visible elements.
        """
        fields = {}
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            scripts = soup.find_all('script')
            data_script = None
            for script in scripts:
                if script.string and 'FB_PUBLIC_LOAD_DATA_' in script.string:
                    data_script = script.string
                    break

            if not data_script:
                print("Could not find FB_PUBLIC_LOAD_DATA_ script tag. Trying visible elements method.")
                return None # Signal to try the other method

            # Extract the JSON-like data part
            # This part is fragile as the exact format might change
            match = re.search(r'FB_PUBLIC_LOAD_DATA_\s*=\s*(.*?);', data_script, re.DOTALL)
            if match:
                data_str = match.group(1)
                # It's not perfect JSON, often needs adjustments (like removing trailing commas)
                # This is a common issue, trying a lenient parse
                try:
                    # Attempt to load directly first
                    data = json.loads(data_str)
                except json.JSONDecodeError:
                     print("Direct JSON parsing failed. Attempting regex fallback for data extraction (less reliable).")
                     # Fallback: Use regex to find question text and entry IDs if JSON fails hard
                     # This regex is VERY specific and likely to break
                     pattern = re.compile(r'\["(.+?)",\s*null,\s*null,\s*(\d+),\s*\[\[(\d+),', re.DOTALL)
                     matches = pattern.findall(data_script) # Search in the whole script as fallback
                     if not matches:
                         print("Regex fallback failed to find question patterns.")
                         return None

                     extracted_data_from_regex = []
                     for m in matches:
                         # Rough structure: [label, type_info, entry_id]
                         extracted_data_from_regex.append([m[0], None, [[int(m[2])]] ]) # Mock structure

                     # Assign to a structure the code below expects
                     # We are making assumptions here!
                     data = [None, extracted_data_from_regex] # Mock top-level structure


                # Navigate the extracted data structure (this structure can change!)
                # Based on common observation: data[1][1] often contains the list of form items
                form_description = data # Start with the raw data
                items = None

                # Try common paths where form items might be located
                potential_paths = [
                     lambda d: d[1][1], # Common path observed
                     lambda d: d[1],    # Simpler path
                     lambda d: d[0][1], # Another variation
                     lambda d: d # Raw data itself if structure is flat
                ]

                for path_func in potential_paths:
                    try:
                        candidate_items = path_func(form_description)
                        # Check if it looks like a list of items (each item is usually a list)
                        if isinstance(candidate_items, list) and all(isinstance(item, list) for item in candidate_items):
                             # Check if items contain potential entry IDs (list with int inside a list)
                             has_entry_id = False
                             if candidate_items and len(candidate_items[0]) > 3 and isinstance(candidate_items[0][4], list) and \
                                len(candidate_items[0][4]) > 0 and isinstance(candidate_items[0][4][0], list) and \
                                len(candidate_items[0][4][0]) > 0 and isinstance(candidate_items[0][4][0][0], int):
                                  has_entry_id = True

                             if has_entry_id:
                                items = candidate_items
                                print(f"Successfully found form items list via path: {path_func.__name__}")
                                break # Found a likely list
                    except (IndexError, TypeError, KeyError):
                        continue # Try the next path

                if not items:
                    print("Could not reliably locate the list of form items within the script data.")
                    return None

                for item in items:
                    try:
                        # Structure: [label, description, question_type_info, item_id_info, ...]
                        # Label is usually item[1]
                        # Entry ID is often nested: item[4][0][0]
                        label = item[1]
                        entry_id = None
                        if len(item) > 4 and isinstance(item[4], list) and len(item[4]) > 0 and \
                           isinstance(item[4][0], list) and len(item[4][0]) > 0 and isinstance(item[4][0][0], int):
                            entry_id = item[4][0][0]

                        if label and entry_id:
                            # Clean up label (remove trailing whitespace, etc.)
                            clean_label = ' '.join(label.strip().split())
                            fields[f"entry.{entry_id}"] = clean_label
                            # print(f"Found via script: Label='{clean_label}', EntryID='entry.{entry_id}'") # Debug
                    except (IndexError, TypeError, KeyError):
                        # Skip item if structure doesn't match expected format
                        # print(f"Skipping item due to unexpected structure: {item[:5]}") # Debug
                        continue
            else:
                print("Could not extract data using regex from FB_PUBLIC_LOAD_DATA_.")
                return None

        except Exception as e:
            print(f"Error processing script data: {e}")
            return None # Signal failure

        if not fields:
            print("No fields extracted from script data.")
            return None
        else:
            print(f"Extracted {len(fields)} fields from script data.")
            return fields

    def extract_form_fields_from_html(self, html_content):
        """
        Fallback method: Extracts form fields by parsing visible HTML elements. Less reliable.
        """
        print("Attempting fallback: Scraping visible HTML elements...")
        fields = {}
        try:
            soup = BeautifulSoup(html_content, 'html.parser')

            # Find all potential input elements (text, textarea, radio, checkbox)
            # Google Forms often wraps questions in divs with specific roles or jscontroller/jsaction attributes
            # This is highly dependent on current Google Forms structure
            # Look for divs that seem to contain a question label and an input
            # Common pattern: a div containing the label text, and sibling/child divs containing inputs
            # Using data-params seems slightly more stable sometimes
            potential_questions = soup.find_all('div', {'jscontroller': True, 'jsaction': True})
            if not potential_questions:
                # Simpler fallback if the above fails
                potential_questions = soup.find_all('div', {'role': 'listitem'})


            print(f"Found {len(potential_questions)} potential question containers.")
            extracted_count = 0

            for q_div in potential_questions:
                # Find the label text within this div
                # Labels might be in spans with specific classes or roles
                label_element = q_div.find(['span', 'div'], {'role': 'heading'})
                label_text = label_element.get_text(strip=True) if label_element else None

                if not label_text:
                     # Try another common pattern for labels
                     label_element = q_div.find(['div', 'span'], class_=lambda x: x and 'exportLabel' in x)
                     label_text = label_element.get_text(strip=True) if label_element else None


                if not label_text:
                    # Skip if no clear label found in this container
                    continue

                # Find associated input/textarea/select elements
                # Look for name attributes starting with "entry."
                inputs = q_div.find_all(['input', 'textarea', 'select'], {'name': re.compile(r'^entry\.\d+')})

                if inputs:
                    # Often, multiple inputs (like radio buttons) share the same name for one question
                    entry_id = inputs[0].get('name')
                    if entry_id and entry_id not in fields:
                        clean_label = ' '.join(label_text.strip().split())
                        fields[entry_id] = clean_label
                        # print(f"Found via HTML: Label='{clean_label}', EntryID='{entry_id}'") # Debug
                        extracted_count += 1
                #else:
                    # print(f"No input found for label: '{label_text}' in container.") # Debug


            print(f"Extracted {extracted_count} fields via HTML scraping.")
            return fields if fields else None

        except Exception as e:
            print(f"Error parsing HTML content: {e}")
            return None

    def normalize_text(self, text):
        """Lowercase, remove punctuation and extra whitespace."""
        if not text: return ""
        text = text.lower()
        text = re.sub(r'[^\w\s]', '', text) # Remove punctuation
        text = ' '.join(text.split()) # Normalize whitespace
        return text

    def match_data_to_fields(self, form_fields, user_data):
        """
        Enhanced matching logic to handle various field name patterns.
        Returns a dictionary {entry_id: user_value}.
        """
        prefill_params = {}
        matched_keys = set()
        matched_entries = set()

        # Define common field patterns
        field_patterns = {
            'name': [
                'name', 'full name', 'fullname', 'student name', 'studentname',
                'candidate name', 'candidatename', 'applicant name', 'applicantname',
                'FULL NAME', 'NAME', 'Full Name', 'Student Name',
                lambda d: f"{d.get('first_name', '')} {d.get('last_name', '')}".strip(),
                'first name', 'firstname', 'last name', 'lastname',
                'FIRST NAME', 'FIRSTNAME', 'LAST NAME', 'LASTNAME'
            ],
            'email': [
                'email', 'email address', 'mail', 'email id', 'emailid', 
                'EMAIL', 'EMAIL ADDRESS', 'MAIL', 'EMAIL ID', 'EMAILID',
                'Email Address', 'E-mail', 'E-MAIL', 'student email', 'STUDENT EMAIL'
            ],
            'phone': [
                'phone', 'phone number', 'mobile', 'contact', 'ph no', 'phno', 
                'mobile number', 'contact number', 'telephone', 'tel',
                'PHONE', 'PHONE NUMBER', 'MOBILE', 'CONTACT', 'PH NO',
                'Phone No.', 'Mobile No.', 'Contact No.',
                'MOBILE NUMBER', 'CONTACT NUMBER', 'whatsapp'
            ],
            'cgpa': [
                'cgpa', 'grade', 'gpa', 'marks', 'percentage', 'score',
                'CGPA', 'GRADE', 'GPA', 'MARKS', 'PERCENTAGE',
                'academic score', 'academic percentage', 'aggregate'
            ],
            'tenth_cgpa': [
                'tenth cgpa', '10th', 'sslc', 'tenth grade', '10th grade',
                'SSLC', 'TENTH', '10TH', 'X', 'tenth percentage',
                'sslc marks', 'sslc grade', 'sslc cgpa', 'SSLC cgpa', 'class x',
                'CLASS X', 'SSLC PERCENTAGE', '10th marks', 'tenth marks'
            ],
            'twelth_cgpa': [
                'twelth cgpa', '12th', 'hsc', 'plus two', 'higher secondary',
                'TWELTH', '12TH', 'HSC', 'PLUS TWO', 'HIGHER SECONDARY',
                'XII', 'class xii', 'CLASS XII', 'puc', 'PUC',
                '12th marks', 'hsc marks', 'plus two marks',
                'intermediate', 'INTERMEDIATE'
            ],
            'degree_cgpa': [
                'degree cgpa', 'degree', 'ug cgpa', 'undergraduate cgpa',
                'DEGREE CGPA', 'UG', 'UNDERGRADUATE', 'bachelors',
                'graduation', 'graduate', 'degree percentage',
                'ug percentage', 'undergraduate percentage',
                'current cgpa', 'present cgpa'
            ],
            'registration': [
                'registration number', 'reg no', 'regno', 'register number',
                'REGISTRATION NUMBER', 'REG NO', 'REGNO', 'REGISTER NUMBER',
                'registration no', 'registration id', 'reg id', 'regid',
                'Roll No', 'roll number', 'ROLL NO', 'ROLL NUMBER',
                'admission number', 'adm no', 'admno'
            ],
            'department': [
                'department', 'dept', 'branch', 'specialization',
                'DEPARTMENT', 'DEPT', 'BRANCH', 'SPECIALIZATION',
                'course', 'stream', 'field', 'major',
                'COURSE', 'STREAM', 'FIELD', 'MAJOR'
            ],
            'program': [
                'program', 'course', 'degree program', 'degree course',
                'PROGRAM', 'COURSE', 'DEGREE PROGRAM', 'programme',
                'study program', 'field of study', 'discipline',
                'degree type', 'qualification'
            ],
            'semester': [
                'semester', 'sem', 'current semester', 'study year',
                'SEMESTER', 'SEM', 'CURRENT SEMESTER', 'year',
                'academic year', 'current year', 'sem no', 'term'
            ],
            'skills': [
                'skills', 'technical skills', 'skill set', 'competencies',
                'SKILLS', 'TECHNICAL SKILLS', 'SKILL SET',
                'programming languages', 'technologies', 'tools',
                'technical expertise', 'core competencies'
            ],
            'linkedin': [
                'linkedin', 'linkedin url', 'linkedin profile', 'linkedin link',
                'LINKEDIN', 'LinkedIn', 'LinkedIn URL', 'LinkedIn Profile',
                'social media', 'professional profile'
            ]
        }

        def get_composite_value(key, data):
            """Handle composite fields like full name"""
            if key == 'name':
                if 'first_name' in data and 'last_name' in data:
                    return f"{data['first_name']} {data['last_name']}".strip()
            return None

        # First pass: Direct matches with pattern variations
        for entry_id, form_label in form_fields.items():
            if entry_id in matched_entries:
                continue

            norm_form_label = self.normalize_text(form_label)
            
            # Check against each pattern group
            for field_type, patterns in field_patterns.items():
                matched = False
                
                # Try composite values first
                composite_value = None
                for pattern in patterns:
                    if callable(pattern):
                        composite_value = pattern(user_data)
                        if composite_value:
                            prefill_params[entry_id] = composite_value
                            matched_entries.add(entry_id)
                            matched = True
                            print(f"Composite Match: Form Label '{form_label}' -> Generated value '{composite_value}'")
                            break
                            
                if matched:
                    continue

                # Try pattern matching
                for pattern in patterns:
                    if isinstance(pattern, str):
                        pattern_norm = self.normalize_text(pattern)
                        
                        # Check if pattern matches form label
                        if pattern_norm in norm_form_label or norm_form_label in pattern_norm:
                            # Look for matching user data keys
                            for user_key, user_value in user_data.items():
                                user_key_norm = self.normalize_text(user_key)
                                if pattern_norm in user_key_norm or user_key_norm in pattern_norm:
                                    prefill_params[entry_id] = user_value
                                    matched_keys.add(user_key)
                                    matched_entries.add(entry_id)
                                    matched = True
                                    print(f"Pattern Match: Form Label '{form_label}' -> User Key '{user_key}'")
                                    break
                    
                    if matched:
                        break
                
                if matched:
                    break

        # Special handling for CGPA fields
        if 'cgpa' in [self.normalize_text(k) for k in user_data.keys()]:
            for entry_id, form_label in form_fields.items():
                if entry_id not in matched_entries and 'cgpa' in self.normalize_text(form_label):
                    # Default to degree_cgpa if specific type not mentioned
                    prefill_params[entry_id] = user_data.get('degree_cgpa', user_data.get('cgpa'))
                    matched_entries.add(entry_id)

        print("\n--- Matching Summary ---")
        print(f"Matched {len(prefill_params)} fields.")
        print(f"Unmatched form fields: {set(form_fields.keys()) - matched_entries}")
        print(f"Unused user data: {set(user_data.keys()) - matched_keys}")

        return prefill_params

    def create_prefilled_url(self, form_url, prefill_params):
        """Appends prefill parameters to the Google Form URL."""
        # Ensure we are using the viewform URL
        parsed_url = urlparse(form_url)
        # Ensure path ends with /viewform, replacing /formResponse if present
        path = parsed_url.path
        if path.endswith('/formResponse'):
            path = path.replace('/formResponse', '/viewform')
        elif not path.endswith('/viewform'):
             # Handle cases where it might be just the form ID like /d/e/FORM_ID/
             if not path.endswith('/'): path += '/'
             path += 'viewform' # Append viewform if not present

        # Clean existing query params - prefilling typically replaces them
        # query = parse_qs(parsed_url.query) # Keep existing params if needed
        # query.update(prefill_params) # Update/add our params
        encoded_params = urlencode(prefill_params) # Encode our params directly

        # Reconstruct the URL
        prefilled_url = urlunparse((
            parsed_url.scheme,
            parsed_url.netloc,
            path,
            parsed_url.params, # Usually empty
            encoded_params,    # Our prefill data as the query string
            parsed_url.fragment # Usually empty
        ))
        return prefilled_url

    def process_form(self, input_url, user_data):
        """Main method to process the form and generate a prefilled URL."""
        print(f"\nUser Data Provided: {user_data}")

        # Step 1: Expand URL
        print("\n--- Step 1: Expanding URL ---")
        self.form_url = self.expand_shortened_url(input_url)

        if not self.form_url:
            print("Could not get a valid Google Form URL. Exiting.")
            return None

        # Step 2: Fetch and Parse Form
        print("\n--- Step 2: Fetching and Parsing Form ---")
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(self.form_url, headers=headers, timeout=15)
            response.raise_for_status()
            html_content = response.text

            # Try script extraction first
            self.form_fields = self.extract_form_fields_from_script(html_content)

            # Fall back to HTML scraping if needed
            if not self.form_fields:
                self.form_fields = self.extract_form_fields_from_html(html_content)

        except requests.exceptions.RequestException as e:
            print(f"Error fetching form content: {e}")
            return None
        except Exception as e:
            print(f"An unexpected error occurred during form fetching/parsing: {e}")
            return None

        if not self.form_fields:
            print("Could not extract form fields. Unable to prefill.")
            return None

        # Step 3: Match Data to Fields
        print("\n--- Step 3: Matching Data to Fields ---")
        prefill_data = self.match_data_to_fields(self.form_fields, user_data)

        # Step 4: Create Prefilled URL
        if prefill_data:
            print("\n--- Step 4: Generating Prefilled URL ---")
            prefilled_link = self.create_prefilled_url(self.form_url, prefill_data)
            print(f"\n✅ Prefilled URL Generated:")
            print(prefilled_link)
            return prefilled_link
        else:
            print("\n--- Step 4: Generating Prefilled URL ---")
            print("⚠️ No data could be matched to form fields. Cannot generate a prefilled URL.")
            return self.form_url

# if __name__ == "__main__":
#     # Example usage
#     input_url = input("Enter the Google Form URL: ")
#     user_data = {
#         "Full Name": "Vimal Mathew",
#         "email address": "vimal@example.com",
#         "age": "28",
#         "Your Comments": "This is a test prefill.",
#         "Country": "India"
#     }

#     prefiller = GoogleFormPrefiller()
#     result_url = prefiller.process_form(input_url, user_data)
    
#     if result_url:
#         print("\nNOTE: Please open the link above, verify the prefilled data, complete any remaining fields, and submit the form manually.")

prefill_mgr = GoogleFormPrefiller()