alter table scheduler.scheduling_specification_goals
  add column goal_invocation_id integer generated by default as identity,

  drop constraint scheduling_specification_goals_primary_key,
  add constraint scheduling_specification_goals_primary_key
    primary key (goal_invocation_id);

comment on column scheduler.scheduling_specification_goals.goal_invocation_id is e''
  'The id of a specific goal invocation in the specification. Primary key.';

-- update goal_analysis PK
alter table scheduler.scheduling_goal_analysis
  add column goal_invocation_id integer null, -- temp set as nullable so we can insert, made not null by PK constraint below

  drop constraint scheduling_goal_analysis_primary_key;

comment on column scheduler.scheduling_goal_analysis.goal_invocation_id is e''
  'The associated goal invocation ID.';

update scheduler.scheduling_goal_analysis as sga
set goal_invocation_id = ssg.goal_invocation_id
from scheduler.scheduling_request as sr
       join scheduler.scheduling_specification_goals as ssg
            on sr.specification_id = ssg.specification_id
where sr.analysis_id = sga.analysis_id
  and sga.goal_id = ssg.goal_id;

alter table scheduler.scheduling_goal_analysis
  add constraint scheduling_goal_analysis_primary_key
    primary key (analysis_id, goal_invocation_id);

-- update created_activities PK
alter table scheduler.scheduling_goal_analysis_created_activities
  drop constraint created_activities_primary_key,
  -- temp set as nullable so we can insert, made not null by PK constraint below
  add column goal_invocation_id integer null;

comment on column scheduler.scheduling_goal_analysis_created_activities.goal_invocation_id is e''
  'The associated goal invocation ID from the scheduling specification.';

update scheduler.scheduling_goal_analysis_created_activities as sgaca
set goal_invocation_id = ssg.goal_invocation_id
from scheduler.scheduling_request as sr
       join scheduler.scheduling_specification_goals as ssg
            on sr.specification_id = ssg.specification_id
where sr.analysis_id = sgaca.analysis_id
  and sgaca.goal_id = ssg.goal_id;

alter table scheduler.scheduling_goal_analysis_created_activities
  drop column goal_id,
  drop column goal_revision,

  add constraint created_activities_primary_key
    primary key (analysis_id, goal_invocation_id, activity_id),
  add constraint created_activities_references_scheduling_goal_analysis
    foreign key (analysis_id, goal_invocation_id)
      references scheduler.scheduling_goal_analysis
      on update cascade
      on delete cascade;

-- update satisfing_activities PK
alter table scheduler.scheduling_goal_analysis_satisfying_activities
  drop constraint satisfying_activities_primary_key,
  -- temp set as nullable so we can insert, made not null by PK constraint below
  add column goal_invocation_id integer null;

comment on column scheduler.scheduling_goal_analysis_satisfying_activities.goal_invocation_id is e''
  'The associated goal invocation ID from the scheduling specification.';

update scheduler.scheduling_goal_analysis_satisfying_activities as sgasa
set goal_invocation_id = ssg.goal_invocation_id
from scheduler.scheduling_request as sr
       join scheduler.scheduling_specification_goals as ssg
            on sr.specification_id = ssg.specification_id
where sr.analysis_id = sgasa.analysis_id
  and sgasa.goal_id = ssg.goal_id;

alter table scheduler.scheduling_goal_analysis_satisfying_activities
  drop column goal_id,
  drop column goal_revision,

  add constraint satisfying_activities_primary_key
    primary key (analysis_id, goal_invocation_id, activity_id),
  add constraint satisfying_activities_references_scheduling_goal_analysis
    foreign key (analysis_id, goal_invocation_id)
      references scheduler.scheduling_goal_analysis
      on update cascade
      on delete cascade;

call migrations.mark_migration_applied('9');
