import configparser

ALLOCATIONS_API_CONFIG = configparser.ConfigParser()
ALLOCATIONS_API_CONFIG.read('allocations_api.ini')
if(len(ALLOCATIONS_API_CONFIG.sections()) == 0):
    print("Empty configuration")
    exit()