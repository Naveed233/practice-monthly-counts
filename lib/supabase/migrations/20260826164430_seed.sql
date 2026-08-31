begin;
with params as (
    select
        'project_1':: text as project_1,
        'project_2':: text as project_2,
        'project_3':: text as project_3
),

--generating ticket rows per project (N rows per project across 6 months)

project_1_rows as (
    select
        p.project_1 as project_id,
        gs.i as N
    from params p,
    generate_series(1,2600) as gs(i)
), 

project_2_rows as (
    select 
        p.project_2 as project_id,
        gs.i as N
    from params p,
    generate_series(1,400) as gs(i)
),

project_3_rows as (
    select 
        p.project_3 as project_id,
        gs.i as N
    from params p,
    generate_series(1,600) as gs(i)
),

all_rows as (
    select * from project_1_rows
    union ALL 
    select * from project_2_rows
    union all
    select * from project_3_rows
),

--map row number -> timestamp spread across 7 months and 
-- whether prediction_executed_at is NULL

final as (
    select
        --stable id generation
        row_number() over (order by project_id, n) as new_id,
        project_id,

        --created at also spread around the same window
        (timestamp with time zone 
        '2026-01-01 00:00:00+00'
        + make_interval (days => ((n*3) % 180)) -- 6 months window
        + ((n%24) || ' hours')::interval
        ) as created_at, 

        --prediction_executed_at: same window but sometimes null

        case
            -- make 10% null using deterministic rule
            when(mod(n,10) = 0) then
            null
            else
                (timestamp with time zone 
                '2026-01-02 00:00:00+00'
                + make_interval (days => ((n*5) % 180) % 180) 
                -- 6 months window
                + ((n%18) || ' hours')::interval
            )
        end as prediction_executed_at
    from all_rows
)

insert into public.tickets
(id, project_id, created_at, prediction_executed_at)
select
    new_id::int,
    project_id,
    created_at,
    prediction_executed_at
from final
order by project_id, new_id;

commit;
