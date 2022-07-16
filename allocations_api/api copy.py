from turtle import clear
from xml.dom import NoModificationAllowedErr
from flask import Flask
from flask_restful import reqparse, abort, Resource, Api
from subprocess import check_output
from flask_cors import CORS
import pandas as pd
import re
from Organization import Organization

app = Flask(__name__)
CORS(app)
api = Api(app)


class Allocations(Resource):
    
    alloc_summary = None
    
    def __init__(self):
        self.alloc_summary = None
     
    def get(self):
        if Allocations.alloc_summary is None:
            self._load_organization()            
            self._load_summary_table();
            
        return Allocations.alloc_summary.to_json()
    
    def _load_organization(self):
        Organization.open_sessions()            
        self.org = Organization('CN=Sukumar Bhasker,OU=Users,OU=GSS,OU=IN,DC=asia,DC=ad,DC=flextronics,DC=com')
        
    
    def _load_summary_table(self):
        
        file_name = "C:/SourceCode/ResourceAllocation/data/resource_allocation/GSD Portfolio Consolidated Actuals  Forecast Data May 22.xlsx";
        df = pd.read_excel(file_name, "Consolidated file ")
        df["L2 Organization"] = df["Email"].apply(lambda email : self.org.owning_org(email, 2))
        df["L3 Organization"] = df["Email"].apply(lambda email : self.org.owning_org(email, 3))

        alloc_detail = df [[
            "Leads",
            "L2 Organization",
            "L3 Organization",
            "Project ",
            "Updated App name",
            "Business Segment",
            "Resource Name", 
            "Actual FTE"
        ]]
        
        
        alloc_detail = alloc_detail[alloc_detail["Actual FTE"] > 0]

        alloc_detail.rename(columns={
            "Leads" : "Lead",
            "Project " : "Project",
            "Updated App name" : "Application",
            "Business Segment": "Business Segment",
            "Resource Name": "Resource",
            "Actual FTE": "Allocation"
        }, inplace=True)

        save_file_name = "C:/SourceCode/ResourceAllocation/data/resource_allocation/GSD Portfolio May 22 Detail.xlsx";
        alloc_detail.to_excel(save_file_name)

        alloc_summary = alloc_detail.groupby([
            "Lead", 
            "Application", 
            "Business Segment", 
            "Project", 
            "Resource",
            "L2 Organization",
            "L3 Organization"
        ]).sum()
        alloc_summary = alloc_summary.reset_index()
        alloc_summary["Allocation"] = alloc_summary["Allocation"].apply(lambda x: int(x*100) / 100) 
        
        save_file_name = "C:/SourceCode/ResourceAllocation/data/resource_allocation/GSD Portfolio May 22 Summary.xlsx";
        alloc_summary.to_excel(save_file_name)
        
        Allocations.alloc_summary = alloc_summary      

def host_ip():
    output = str(check_output("ipconfig"), 'UTF-8')
    match = re.search("IPv4 Address. . . . . . . . . . . : ([\d,\.]+)", output)
    ip = None
    if match:
        ip = match.group(1)
        
    return ip

ENVIRONMENT = ["PRODUCTION", "DEVELOPMENT"][1]
LOCAL_HOST = "127.0.0.1"

if ENVIRONMENT == "PRODUCTION":
    host = host_ip()
    if not host:
        host = LOCAL_HOST
else:
    host = LOCAL_HOST    

api.add_resource(Allocations, '/allocations')
if __name__ == '__main__':
    app.run(debug=True, host=host)