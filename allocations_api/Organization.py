from dis import dis
from ms_active_directory import ADDomain
import re

from Configuration import ALLOCATIONS_API_CONFIG

class Organization:

    ad_sessions = {}
    
    AD_FLEX     = 'ad.flextronics.com'
    AD_AMERICAS = 'americas'
    AD_ASIA     = 'asia'
    AD_EUROPE   = 'europe'
    
    
    def __init__(self, parent_dn):
        if Organization.ad_sessions == {}:
            Organization.open_sessions();
        
        self.dn = parent_dn
        self.parse_ad(parent_dn)
        
        return
    
    @staticmethod
    def open_sessions():
        user_name   = ALLOCATIONS_API_CONFIG['Active Directory']['user name']
        password    = ALLOCATIONS_API_CONFIG['Active Directory']['password']

        domain_prefixes = [ Organization.AD_AMERICAS, Organization.AD_ASIA,Organization.AD_EUROPE]
        for prefix in domain_prefixes:
            domain = ADDomain(prefix + "." + Organization.AD_FLEX)
            Organization.ad_sessions[prefix] = domain.create_session_as_user(user_name, password) 
        
        return
        
    def parse_ad(self, parent_dn):
        children = {}
        
        parent = self._find_user(parent_dn)
        self.email = parent.get('mail')
        self.workday_id = parent.get('employeeNumber') 
        self.title = parent.get('title')
        
        if parent is not None:
            direct_reports = parent.get('directReports');
            if direct_reports:
                for name in direct_reports:
                    children[name] = Organization(name)
            
        self.children = children

    def _find_user(self, user_dn):
        user = None
        for region in Organization.ad_sessions:
            user = Organization.ad_sessions[region].find_user_by_distinguished_name(user_dn, [
                'directReports', 
                'mail', 
                'employeeNumber',
                'title'
            ])
            if user is not None:
                break
            
        return user

    def unique_display_name(self):
        match = re.search("CN=([^\,]*)\,.*", self.dn)
        if match:
            name = match.group(1)
            return name
            
        return None
    
    def display_name(self):
        name = self.unique_display_name();
        match = re.search("\(.*\)", name)
        if match:
            name = name.replace(match.group(0), "")
            
        return name
    
    def _contains(self, email):
        if(self.email is not None):
            if email.lower().strip() == self.email.lower().strip():
                return True
            else:
                found = False
                for child_dn in self.children:
                    found = self.children[child_dn]._contains(email)
                    if found:
                        break
                return found
        else:
            return False
                        
    def owning_org(self, email, level):
        if level == 0:
            if self._contains(email):
                return self.display_name()
            else:
                return None
        else:
            s = None
            for child_dn in self.children:
                s = self.children[child_dn].owning_org(email, level-1)
                if s:
                    break
            return s
        
    def depth_first_list(self):
        list = []
        
        list.append(self.email())
        for child_dn in self.children:
            list.extend(self.children[child_dn].depth_first_list())
            
        return list

    def parent_child_list(self):
        pc = { self.children[child].email : self.email  for child in self.children }
        
        for child in self.children:
            pc |= self.children[child].parent_child_list()
        
        return pc       
    

"""        
parentName = 'CN=Sukumar Bhasker,OU=Users,OU=GSS,OU=IN,DC=asia,DC=ad,DC=flextronics,DC=com'
sukumar_org = Organization(parentName)
save_org(sukumar_org)
"""
