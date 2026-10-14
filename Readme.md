Database - Postgres 19
Language - Javascript
Libraries - Sequelize

Installation: 1. run db.sql in a postgres 19 instance. Update db connection string in line 5 of db.js
              2. npm i -S
              3. run api.js (or press f5 in a vscode window with the project open)


Schema - Notes :
 
 Tables: 
  Notes:
     id - auto inc int - primary key;
     user_id - int - Users
     last_edited -timestamp with timezone
     note_text - nvarchar



     this suffices for a bare bones note taking backend.
     Does not handle "collaboration", one user can have many notes, but users cannot edit the same note. 
     Also doesn't handle any sort of "history", which could be built with a "note_edits" where we store text, and swapping the 'current_note_text' field for a 'current_note-edit' id. 


  Users
     id -
     user_name 


Tradeoffs

Not necessarily the best route for developing with teams, but I had three hours, and this is what I use when I need to easily interact with a database and pull data.

     

