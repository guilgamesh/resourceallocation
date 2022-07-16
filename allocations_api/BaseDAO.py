from mysql.connector import Error
from mysql.connector import connect

class BaseDAO:
        
    def __init__(self, connection_params):
        self.connection_params = connection_params
            
        return
    
    def open_connection(self):
        try:
            self.connection = connect(
                host        = self.connection_params['host'],
                database    = self.connection_params['database'],
                user        = self.connection_params['user'],
                password    = self.connection_params['password']
            )
        except Error as e:
            raise e
        
    def close_connection(self):
        try:
            self.connection.close()
        except Error as e:
            raise e
        
    def commit(self):
        try:
            self.connection.commit()
        except Error as e:
            raise e

    def execute_query(self, sql, params):
        try:
            cursor = self.connection.cursor(prepared=True);
            cursor.execute(sql, params)
            return cursor.fetchall()
            
        except Error as e:
            raise e
            
    def execute_update(self, sql, params):
        try:
            cursor = self.connection.cursor(prepared=True);
            cursor.execute(sql, params)
            return cursor.rowcount
        except Error as e:
            raise e
