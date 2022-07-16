import re
from mysql.connector import Error
from mysql.connector import connect

from inspect import currentframe

from BaseDAO import BaseDAO
from Configuration import ALLOCATIONS_API_CONFIG
from Organization import Organization

class DevelopmentDAO(BaseDAO):
    
    ConnectionParams = None
    SQLCommandCatalogue = None
    
    def __init__(self):
        if DevelopmentDAO.ConnectionParams is None:
            DevelopmentDAO.ConnectionParams = ALLOCATIONS_API_CONFIG['Database']
            DevelopmentDAO.SQLCommandCatalogue = ALLOCATIONS_API_CONFIG['SQL Command Catalogue']

        super().__init__(DevelopmentDAO.ConnectionParams)
        
        return
    
    def save_organization(self, org, parent_email = None):

        result = self._resource_id(parent_email) 
        id = None if result is None else result[0][0]
        
        self._insert_resource(org, id)
        
        for child_dn in org.children:
            self.save_organization(org.children[child_dn], org.email)

    def _resource_id(self, email):
        if email is not None:
            sql = self._method_query(currentframe())
            result = self.execute_query(sql, (email,))
            return result          
        else:
            return None

    def _insert_resource(self, org, parent_id):
        sql = self._method_query(currentframe()) 
        params = (org.display_name(), org.email, org.workday_id, org.title, parent_id) 
        result = self.execute_update(sql, params)
            
    def _method_query(self, frame):
        query_name = frame.f_code.co_name.replace("_", " ").strip()
        query = DevelopmentDAO.SQLCommandCatalogue[query_name]
        if query is None:
            raise f"query '{query_name}' not found in config file"
        
        return query

    def select_organization(self, parent_email):
        sql = self._method_query(currentframe()) 
        params = (parent_email,) 
        result = self.execute_query(sql, params)
        
        return result

dev_dao = DevelopmentDAO()
dev_dao.open_connection()

parent_email = 'aristoteles.portillo@flex.com'
org = dev_dao.select_organization(parent_email)

dev_dao.close_connection()
