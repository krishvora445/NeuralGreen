from app import app

if __name__ == '__main__':
    print("Starting NeuralGreen Backend Server...")
    app.run(host='0.0.0.0', port=5001, debug=True)
