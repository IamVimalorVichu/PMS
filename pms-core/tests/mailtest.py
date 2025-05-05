import smtplib

def test_smtp_connection():
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.ehlo()
        server.starttls()
        server.login('vimalmathew26@gmail.com', 'lkenfrdlhfvzjiam')
        print("Connection successful!")
        server.quit()
    except Exception as e:
        print(f"Connection failed: {e}")

test_smtp_connection()