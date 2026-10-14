import { pg_insert,pg_read_simple,linkChildToParent, unlinkChildFromParent, pgsql, pg_update } from './db.js';
import { notes, users } from './domain_constants.js';

export const fetchUserNotes = async (user) => await pg_read_simple(notes, {user_id:user})

export const fetchUserNote = async (user,note) => await pg_read_simple(notes, {user_id:user, id:note})

export const fetchUser = async(uid) => await pg_read_simple(users, {id:uid})

export const createNote = async (note) => await pg_insert(notes, note);
export const createUser = async(user) => await pg_insert(users, user);

export const patchUserNote = async(note) => {

 return await pgsql.query(`Update notes.notes set note_text = '${note.note_text}' where id =${note.id}`)

}

export const createUserNote = async(note, user) => {
    await linkChildToParent(notes,users,note, user);
}
