import pandas as pd

FLEX_PM_BOX_PATH = "C:/Users/gdlaport/Box/FlexPM Tableau Report David Smith"

def open_flex_pm_file(file_name):
    full_file_name = "{0}/{1}.xlsx".format(FLEX_PM_BOX_PATH, file_name)
    return pd.read_excel(full_file_name)

