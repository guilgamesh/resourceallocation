from dis import dis
from ms_active_directory import ADDomain
import re

class Organization:

    ad_sessions = {}
    
    AD_FLEX     = 'ad.flextronics.com'
    AD_AMERICAS = 'americas'
    AD_ASIA     = 'asia'
    AD_EUROPE   = 'europe'
    
    
    def __init__(self, parent_dn):
        self.name = parent_dn
        self.children = self.extract_children(parent_dn)
        
        return
    
    @staticmethod
    def open_sessions():
        user_name = "gdlaport@americas.ad.flextronics.com"
        password = "Fresa#123"

        domain_prefixes = [ Organization.AD_AMERICAS, Organization.AD_ASIA,Organization.AD_EUROPE]
        for prefix in domain_prefixes:
            domain = ADDomain(prefix + "." + Organization.AD_FLEX)
            Organization.ad_sessions[prefix] = domain.create_session_as_user(user_name, password) 
        
        return
        
    def extract_children(self, parent_dn):
        children = {}
        parent = self._find_user(parent_dn)
        
        if parent is not None:
            direct_reports = parent.get('directReports');
            if direct_reports:
                for name in direct_reports:
                    children[name] = Organization(name)
            
        return children

    def _find_user(self, user_dn):
        for region in Organization.ad_sessions:
            user = Organization.ad_sessions[region].find_user_by_distinguished_name(user_dn, ['directReports'])
            if user is not None:
                break
            
        return user

    def display_name(self):
        match = re.search("CN=([\w,\s]*)\,.*", self.name)
        if match:
            name = match.group(1)
            return name
            
        return None
    
    def _contains(self, displayName):
        if displayName == self.display_name():
            return True
        else:
            found = False
            for child_dn in self.children:
                found = self.children[child_dn]._contains(displayName)
                if found:
                    break
            return found
                
    def owning_org(self, displayName, level):
        if level == 0:
            if self._contains(displayName):
                return self.display_name()
            else:
                return None
        else:
            s = None
            for child_dn in self.children:
                s = self.children[child_dn].owning_org(displayName, level-1)
                if s:
                    break
            return s
        
    def depth_first_list(self):
        list = []
        
        list.append(self.display_name())
        for child_dn in self.children:
            list.extend(self.children[child_dn].depth_first_list())
            
        return list

"""
                 
Organization.open_sessions()
parentName = 'CN=Sukumar Bhasker,OU=Users,OU=GSS,OU=IN,DC=asia,DC=ad,DC=flextronics,DC=com'
sukumar_org = Organization(parentName)

print("Person", "|", "L1 Org", "|", "L2 Org")
print("="*60)
for person in sukumar_org.depth_first_list():
    print(person, "|", sukumar_org.owning_org(person, 1), "|", sukumar_org.owning_org(person, 2))
print("="*60)

"""