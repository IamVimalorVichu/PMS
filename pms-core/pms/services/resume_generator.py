from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
from pathlib import Path
import os
from io import BytesIO

class ResumeGenerator:
    def __init__(self):
        template_dir = Path(__file__).parent.parent / 'templates'
        self.env = Environment(loader=FileSystemLoader(str(template_dir)))
        
    def generate_pdf(self, resume_data: dict) -> BytesIO:
        try:
            template = self.env.get_template('resume.html')
            html_content = template.render(resume=resume_data)
            
            # Convert HTML to PDF
            pdf_buffer = BytesIO()
            HTML(string=html_content).write_pdf(pdf_buffer)
            pdf_buffer.seek(0)
            
            return pdf_buffer
        except Exception as e:
            raise Exception(f"Error generating PDF: {str(e)}")

resume_generator = ResumeGenerator()