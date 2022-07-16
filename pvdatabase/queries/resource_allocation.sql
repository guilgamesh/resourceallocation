-- Tables involved
--  ip.structure
--  ip.ip_user
--  ip.resources
--  ip.custom_resources
--  ip.planning_entity
--  ip.daily_tr

SELECT  
    flx_workday_id  AS 'Workday ID',
    ADID,
    Resource_Name   AS Resource_Name,
    Email,
    substring(Groups ,1,charindex('_l',Groups)-1) AS Groups,
    Day_date,
    ProjectID       AS 'Project ID',
    ProjectName     AS 'Project Name',
    Project_NEW,
    Phase_NEW,
    Site_Segment,
    Hours_Logged    AS 'Logged Hours'
FROM
(
    select
        r.logon_id ADID,
        cr.flx_workday_id,
        (select description from ip.structure where structure_code=r.resource_code) Resource_Name,
        (select e_mail from ip.ip_user where user_name=r.logon_id)  Email,
        (select description from ip.structure_tree st join ip.structure s on s.structure_code=st.anc_code
            where st.dsc_code=r.resource_code and anc_depth='4') Groups,
        tr.Day_date,
        pe.short_name AS ProjectID,
        isnull((select description from ip.structure where structure_code=pe.ppl_code),
            (select description from ip.structure where structure_code=tr.activity_code)) ProjectName,
        isnull((select description from ip.structure where structure_code=pe.ppl_code and depth = '8' ),
            (select description from ip.structure where structure_code=tr.activity_code and structure_name = 'StdAct'))Project_NEW,
        (select description from ip.structure where structure_code=tr.activity_code and depth = '9' ) Phase_NEW,
        (select description from ip.structure  inner join ip.structure_tree stree on stree.anc_code = structure_code
            where stree.dsc_code = pe.ppl_code and stree.anc_depth = '7')    Site_Segment,
        tr.Daily_effort/60000.00 as 'Hours_Logged'
    FROM 
        ip.daily_tr tr
        join ip.resources r on r.resource_code=tr.resource_code
        join ip.custom_resource cr on cr.resource_code=r.resource_code
        left join ip.planning_entity pe on pe.planning_code=tr.activity_code
    WHERE
        (select description from ip.structure_tree st join ip.structure s on s.structure_code=st.anc_code
        where st.dsc_code=r.resource_code and anc_depth='4') in('Sukumar Bhasker_L4')
        and
        month(tr.Day_date)=5 and year(tr.day_date)='2022'  
) FINAL

ORDER BY 
    Resource_name,
    day_date