from turtle import clear
from flask import Flask
from flask_restful import reqparse, abort, Resource, Api
from flask_cors import CORS
import pandas as pd

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
            
        return Allocations.alloc_summary.to_json()
    
    def load_summary_table(self):
        
        file_name = "C:/SourceCode/ResourceAllocation/data/resource_allocation/GSD Portfolio Consolidated Actuals  Forecast Data.xlsx";
        df = pd.read_excel(file_name, "Raw data ")

        alloc_detail = df [[
            "Lead",
            "Project Name ",
            "Application-ii",
            "Business Segment",
            "Resource Name", 
            "Actual time Apr"
        ]]

        alloc_detail = alloc_detail[alloc_detail["Actual time Apr"] > 0]

        alloc_detail.rename(columns={
            "Project Name " : "Project",
            "Application-ii" : "Application",
            "Business Segment": "Business Segment",
            "Resource Name": "Resource",
            "Actual time Apr": "Allocation"
        }, inplace=True)

        alloc_summary = alloc_detail.groupby(["Lead", "Application", "Project", "Resource"]).sum()
        alloc_summary = alloc_summary.reset_index()
        alloc_summary["Allocation"] = alloc_summary["Allocation"].apply(lambda x: int(x*100) / 100) 
        
        return alloc_summary      
        
        '''
        parser = reqparse.RequestParser()  # initialize
        
        parser.add_argument('userId', required=True)  # add args
        parser.add_argument('name', required=True)
        parser.add_argument('city', required=True)
        
        args = parser.parse_args()  # parse arguments to dictionary
        
        # create new dataframe containing new values
        new_data = pd.DataFrame({
            'userId': args['userId'],
            'name': args['name'],
            'city': args['city'],
            'locations': [[]]
        })        
        '''
        #return {'result':f'The id provides is "{id}"'}

api.add_resource(Allocations, '/allocations')

if __name__ == '__main__':
    app.run(debug=True)
