from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)
# Enable CORS for all routes with a simpler configuration
CORS(app)

@app.route('/api/policies')
def get_policies():
    try:
        # Get the absolute path to the CSV file
        csv_path = os.path.join(os.path.dirname(__file__), 'policies.csv')
        
        # Read the CSV file
        df = pd.read_csv(csv_path)
        
        # Transform the data into the expected format
        policies = []
        for _, row in df.iterrows():
            policy = {
                'id': str(row['policy_id']),
                'title': row['policy_title'],
                'category': row['policy_instrument'],
                'summary': row['policy_description'],
                'facility': {
                    'FAC_NAME': row['policy_name'],
                    'FAC_CITY': row.get('policy_city_or_local', ''),
                    'FAC_STATE': row.get('subnational_region', ''),
                }
            }
            policies.append(policy)
        
        return jsonify(policies)
    except Exception as e:
        print(f"Error: {str(e)}")  # Add logging
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=3000, debug=True)
