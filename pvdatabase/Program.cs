using System.Data.SqlClient;

class Program {

    static void Main(string[] args) {
        SqlConnection con = new SqlConnection(connectionString());
        con.Open();

        SqlCommand cmd = con.CreateCommand();
        cmd.CommandText = sqlText();
        SqlDataReader reader = cmd.ExecuteReader();

        int count = 0;
        while(reader.Read()) {
            count++;
        }

        System.Console.WriteLine($"{count} record returned");

        reader.Close();
        con.Close();
    }

    static string connectionString() {
        string server       = "52.33.248.251,6501";
        string database     = "FXTPROD";
        string user         = "fxtsqluser";
        string password   = "kmPCfNSlilZBRSYswKW9EDvD/IJ9WEB19+QDhJa0bc4=";

        return $"Server={server};Database={database};Uid={user};Pwd={password};";
    }

    static string sqlText() {
        return @"
            select distinct structure_name from ip.structure        
        ";
    }
    static string sqlText2() {
        return @"
            select flx_workday_id as 'Workday ID',ADID,
            Resource_Name as Resource_Name,Email,
            substring(Groups ,1,charindex('_l',Groups)-1)Groups,
            Day_date,
            ProjectID as 'Project ID',
            ProjectName as 'Project Name',
            Project_NEW,
            Phase_NEW,
            Site_Segment,
            Hours_Logged as 'Logged Hours'
            from
            (
            select
            r.logon_id ADID,cr.flx_workday_id,
            (select description from ip.structure where structure_code=r.resource_code)Resource_Name,
            (select e_mail from ip.ip_user where user_name=r.logon_id)Email,
            (select description from ip.structure_tree st join ip.structure s on s.structure_code=st.anc_code
            where st.dsc_code=r.resource_code and anc_depth='4')Groups,
            --(select period_finish-1 from ip.user_period where period_number=tr.period_number)'Weekdate',
            tr.Day_date,
            pe.short_name AS ProjectID,
            isnull((select description from ip.structure where structure_code=pe.ppl_code),
            (select description from ip.structure where structure_code=tr.activity_code))ProjectName,

            isnull((select description from ip.structure where structure_code=pe.ppl_code and depth = '8' ),
            (select description from ip.structure where structure_code=tr.activity_code and structure_name = 'StdAct'))Project_NEW,
            (select description from ip.structure where structure_code=tr.activity_code and depth = '9' ) Phase_NEW,

            (select description from ip.structure  inner join ip.structure_tree stree on stree.anc_code = structure_code
            where stree.dsc_code = pe.ppl_code and stree.anc_depth = '7')    Site_Segment,
            tr.Daily_effort/60000.00 as 'Hours_Logged'
            from ip.daily_tr tr
            join ip.resources r on r.resource_code=tr.resource_code
            join ip.custom_resource cr on cr.resource_code=r.resource_code
            left join ip.planning_entity pe on pe.planning_code=tr.activity_code
            where
            (select description from ip.structure_tree st join ip.structure s on s.structure_code=st.anc_code
            where st.dsc_code=r.resource_code and anc_depth='4') in('Aristoteles Jesus Portillo Diaz_L4')
            and
            month(tr.Day_date)=5 and year(tr.day_date)='2022'  

            )final

            order by Resource_name,day_date
        ";
    }
}