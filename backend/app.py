from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import io

app = Flask(__name__)
CORS(app)

def calculate_cost(data):
    raw_total = sum(float(mat['quantity']) * float(mat['unitCost']) for mat in data['rawMaterials'])
    labor_total = float(data['laborHours']) * float(data['laborRate'])
    overhead = float(data['overhead'])
    misc = float(data['misc'])
    total = raw_total + labor_total + overhead + misc

    return {
        "raw": raw_total,
        "labor": labor_total,
        "overhead": overhead,
        "misc": misc,
        "total": total
    }

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    result = calculate_cost(data)
    return jsonify(result)

@app.route('/generate-pdf', methods=['POST'])
def generate_pdf():
    data = request.get_json()
    result = calculate_cost(data)

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    p.setFont("Helvetica-Bold", 18)
    p.drawString(100, height - 50, "Smart Production Cost Report")

    p.setFont("Helvetica", 12)
    y = height - 100
    p.drawString(50, y, f"Raw Material Cost: ₹{result['raw']:.2f}")
    p.drawString(50, y - 20, f"Labor Cost: ₹{result['labor']:.2f}")
    p.drawString(50, y - 40, f"Overhead: ₹{result['overhead']:.2f}")
    p.drawString(50, y - 60, f"Miscellaneous: ₹{result['misc']:.2f}")
    p.drawString(50, y - 100, f"Total Production Cost: ₹{result['total']:.2f}")

    p.showPage()
    p.save()
    buffer.seek(0)

    return send_file(buffer, as_attachment=True, download_name="Production_Cost_Report.pdf", mimetype='application/pdf')

if __name__ == '__main__':
    app.run(debug=True)
