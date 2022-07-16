from subprocess import check_output
import re

ENVIRONMENT = ["PRODUCTION", "DEVELOPMENT"][1]
LOCAL_HOST = "127.0.0.1"

def start_server(app):
    
    def host_ip():
        output = str(check_output("ipconfig"), 'UTF-8')
        match = re.search("IPv4 Address. . . . . . . . . . . : ([\d,\.]+)", output)
        ip = None
        if match:
            ip = match.group(1)
            
        return ip

    if ENVIRONMENT == "PRODUCTION":
        host = host_ip()
        if not host:
            host = LOCAL_HOST
    else:
        host = LOCAL_HOST    

    if __name__ == 'start_api_server':
        app.run(debug=True, host=host)