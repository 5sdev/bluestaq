create schema if not exists notes 


drop table if exists notes.notes
drop table if exists notes.users

create table if not exists notes.users(
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_name text not null
)

create table if not exists notes.notes(
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id int not null references notes.users (id) ,
  last_edited timestamp with time zone  default NOW(),
  note_text text not null default ''

)