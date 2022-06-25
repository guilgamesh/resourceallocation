import re

n = int(input())

for i in range(n):
    
    l = input()
    while(" && " in l):
        l = l.replace(" && ", " and ")
        
    while(" || " in l):
        l = l.replace(" || ", " or ")    
    
    print(l)