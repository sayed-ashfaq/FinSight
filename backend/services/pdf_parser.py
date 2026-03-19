import pikepdf
import pdfplumber
import tempfile
import os
import re

def unlock_pdf(input_path: str, password: str, output_path: str):
    """Unlock a password-protected PDF using pikepdf."""
    try:
        with pikepdf.open(input_path, password=password) as pdf:
            pdf.save(output_path)
    except pikepdf.PasswordError:
        raise ValueError("Incorrect password provided for the PDF.")
    except Exception as e:
        raise ValueError(f"Failed to unlock PDF: {str(e)}")

def parse_kotak_statement(file_path: str, password: str = None) -> list:
    """Parse Kotak bank statement PDF and extract transactions."""
    working_file = file_path
    temp_unlocked = None
    
    if password:
        temp_fd, temp_unlocked = tempfile.mkstemp(suffix=".pdf")
        os.close(temp_fd)
        unlock_pdf(file_path, password, temp_unlocked)
        working_file = temp_unlocked
        
    transactions = []
    
    try:
        with pdfplumber.open(working_file) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                for table in tables:
                    for row in table:
                        if not row or len(row) < 7:
                            continue
                            
                        # Clean up row items
                        cleaned_row = [str(cell).strip().replace('\n', ' ') if cell else "" for cell in row]
                        date_str = cleaned_row[1]
                        
                        # Match typical date formats DD MMM YYYY, DD-MM-YY, DD/MM/YYYY
                        if re.match(r'^\d{2}[-/]\d{2}[-/]\d{2,4}$', date_str) or re.match(r'^\d{2} [A-Za-z]{3} \d{2,4}$', date_str):
                            description = cleaned_row[2]
                            ref_no = cleaned_row[3]
                            withdrawal = cleaned_row[4]
                            deposit = cleaned_row[5]
                            balance = cleaned_row[6]
                            
                            def parse_amount(amt_str):
                                if amt_str.lower() in ["", "none", "nan", "null"]:
                                    return 0.0
                                amt = re.sub(r'[^\d.]', '', amt_str)
                                return float(amt) if amt else 0.0
                                
                            w_amt = parse_amount(withdrawal)
                            d_amt = parse_amount(deposit)
                            bal = parse_amount(balance)
                            
                            amount = d_amt if d_amt > 0 else -w_amt
                            
                            # Skip if no money moved and no balance changed
                            if amount == 0:
                                continue
                                
                            transactions.append({
                                "date": date_str,
                                "description": description,
                                "ref_no": ref_no,
                                "amount": amount,
                                "balance": bal,
                                "type": "credit" if amount > 0 else "debit"
                            })
                            
    finally:
        if temp_unlocked and os.path.exists(temp_unlocked):
            os.remove(temp_unlocked)
            
    return transactions
