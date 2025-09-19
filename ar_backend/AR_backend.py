"""
ar_backend.py
Flask backend service to handle AR Try-On requests
"""

import os
import subprocess
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile
import threading
import time

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000", 
    "https://*.railway.app",     # Allow Railway domains
    "https://*.vercel.app",      # If frontend deployed on Vercel
    "https://*.netlify.app",     # If frontend deployed on Netlify
    # Add your actual production domain here when you get one
], supports_credentials=True)
# Store active AR processes
active_sessions = {}

def download_product_image(image_url, temp_dir):
    """Download product image from URL to temporary directory"""
    try:
        response = requests.get(image_url, timeout=10)
        response.raise_for_status()
        
        # Get file extension from URL or default to .jpg
        ext = '.jpg'
        if '.' in image_url:
            ext = '.' + image_url.split('.')[-1].lower()
            if ext not in ['.jpg', '.jpeg', '.png', '.bmp']:
                ext = '.jpg'
        
        temp_file = os.path.join(temp_dir, f"product{ext}")
        with open(temp_file, 'wb') as f:
            f.write(response.content)
        
        return temp_file
    except Exception as e:
        raise Exception(f"Failed to download image: {str(e)}")

def run_ar_session(product_image_path, session_id, cam_index=0):
    """Run the AR try-on script in a separate process"""
    try:
        # Path to your AR script
        ar_script_path = "center_virtual_tryon.py"  # Update this path
        
        cmd = [
            "python", ar_script_path,
            "--product", product_image_path,
            "--cam", str(cam_index)
        ]
        
        print(f"Starting AR session {session_id} with command: {' '.join(cmd)}")
        
        # Start the AR process
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Store the process
        active_sessions[session_id] = {
            'process': process,
            'product_path': product_image_path,
            'started_at': time.time()
        }
        
        # Wait for process to complete or be terminated
        stdout, stderr = process.communicate()
        
        # Clean up
        if session_id in active_sessions:
            del active_sessions[session_id]
        
        print(f"AR session {session_id} completed")
        
    except Exception as e:
        print(f"Error in AR session {session_id}: {str(e)}")
        if session_id in active_sessions:
            del active_sessions[session_id]

@app.route('/api/ar-tryon', methods=['POST'])
def start_ar_tryon():
    """Start AR Try-On session"""
    try:
        data = request.get_json()
        product_image_url = data.get('productImageUrl')
        cam_index = data.get('camIndex', 0)
        
        if not product_image_url:
            return jsonify({
                'success': False,
                'error': 'Product image URL is required'
            }), 400
        
        # Create temporary directory for this session
        temp_dir = tempfile.mkdtemp()
        session_id = str(int(time.time() * 1000))
        
        try:
            # Download the product image
            if product_image_url.startswith('http'):
                product_image_path = download_product_image(product_image_url, temp_dir)
            else:
                # Handle local file paths (for uploaded images)
                # Assuming your uploaded images are in public/uploads/products/
                local_path = os.path.join('..', 'public', product_image_url.lstrip('/'))
                if os.path.exists(local_path):
                    product_image_path = local_path
                else:
                    return jsonify({
                        'success': False,
                        'error': 'Product image not found'
                    }), 404
            
            # Start AR session in background thread
            thread = threading.Thread(
                target=run_ar_session,
                args=(product_image_path, session_id, cam_index)
            )
            thread.daemon = True
            thread.start()
            
            return jsonify({
                'success': True,
                'message': 'AR Try-On session started successfully',
                'sessionId': session_id,
                'instructions': {
                    'start': 'AR Try-On window should open shortly...',
                    'controls': 'Use +/- to resize, p to save snapshot, q/ESC to quit',
                    'status': 'AR session starting...'
                }
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Invalid request data'
        }), 400

@app.route('/api/ar-tryon/stop/<session_id>', methods=['POST'])
def stop_ar_session(session_id):
    """Stop an active AR session"""
    try:
        if session_id in active_sessions:
            process = active_sessions[session_id]['process']
            process.terminate()
            del active_sessions[session_id]
            
            return jsonify({
                'success': True,
                'message': f'AR session {session_id} stopped'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Session not found or already stopped'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/ar-tryon/status', methods=['GET'])
def get_ar_status():
    """Get status of all AR sessions"""
    sessions = {}
    for session_id, session_data in active_sessions.items():
        sessions[session_id] = {
            'started_at': session_data['started_at'],
            'running': session_data['process'].poll() is None
        }
    
    return jsonify({
        'success': True,
        'active_sessions': len(active_sessions),
        'sessions': sessions
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'AR Try-On Backend',
        'active_sessions': len(active_sessions)
    })

if __name__ == '__main__':
    import os
    
    # Check if AR script exists
    if not os.path.exists('center_virtual_tryon.py'):
        print("Warning: center_virtual_tryon.py not found")
        print("AR functionality will be limited")
    
    # Railway provides PORT environment variable
    port = int(os.environ.get('PORT', 8002))
    
    print(f"Starting AR Try-On Service on port {port}")
    print("Note: Camera functionality may be limited in cloud environment")
    print(f"Service will be available at: http://0.0.0.0:{port}")
    
    app.run(
        host='0.0.0.0', 
        port=port, 
        debug=False  # Always False in production
    )