from turtle import clear
from flask import Flask
from flask_restful import reqparse, abort, Resource, Api
from flask_cors import CORS
import pandas as pd
from ad_team import Organization

app = Flask(__name__)
CORS(app)
api = Api(app)

class Allocations(Resource):
    
    alloc_summary = None

    alloc_summary_loaded = False
            
    def get(self):
        if not Allocations.alloc_summary_loaded:
            Allocations.alloc_summary = self.load_summary_table();
            Allocations.alloc_summary_loaded = True
            Organization.open_sessions()
            self.org = Organization('CN=Sukumar Bhasker,OU=Users,OU=GSS,OU=IN,DC=asia,DC=ad,DC=flextronics,DC=com')
            
        return Allocations.alloc_summary.to_json()
    
    def load_summary_table(self):
        
        #file_name = "C:/SourceCode/ResourceAllocation/data/resource_allocation/GSD Portfolio Consolidated Actuals  Forecast Data.xlsx";
        file_name = "C:/SourceCode/ResourceAllocation/data/resource_allocation/GSD Portfolio Consolidated Actuals  Forecast Data May 22.xlsx";
        df = pd.read_excel(file_name, "Consolidated file ")

        alloc_detail = df [[
            "Leads",
            "Project ",
            "Updated App name",
            "Business Segment",
            "Resource Name", 
            "Actual FTE"
        ]]
        
        alloc_detail["L1 Organization"] = alloc_detail["Resource Name"].apply(lambda name : self.org.owning_org(name, 1))
        alloc_detail["L2 Organization"] = alloc_detail["Resource Name"].apply(lambda name : self.org.owning_org(name, 2))
        
        alloc_detail = alloc_detail[alloc_detail["Actual FTE"] > 0]

        alloc_detail.rename(columns={
            "Leads" : "Lead",
            "Project " : "Project",
            "Updated App name" : "Application",
            "Business Segment": "Business Segment",
            "Resource Name": "Resource",
            "Actual FTE": "Allocation"
        }, inplace=True)

        alloc_summary = alloc_detail.groupby([
            "Lead", 
            "Application", 
            "Business Segment", 
            "Project", 
            "Resource",
            "L1 Organization",
            "L2 Organization"
        ]).sum()
        alloc_summary = alloc_summary.reset_index()
        alloc_summary["Allocation"] = alloc_summary["Allocation"].apply(lambda x: int(x*100) / 100) 
        
        return alloc_summary      

ENVIRONMENT = ["PRODUCTION", "DEVELOPMENT"][0]
if ENVIRONMENT == "PRODUCTION":
    host = "10.18.74.109"
else:
    host = "127.0.0.1"    

api.add_resource(Allocations, '/allocations')
if __name__ == '__main__':
    app.run(debug=True, host=host)