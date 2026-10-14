import { Sequelize } from "sequelize";
import {schema} from './domain_constants.js'
import {escape as sanitize} from 'sequelize/lib/sql-string';

export const pgsql = new Sequelize('postgres://UNAME:PASS@localhost:5437/postgres');
 const link_array_suffix = "_ids";
export const singularize = (str) => str.substring(0, str.length -1);
export const typeLinkArray =  (type) => singularize(type) + link_array_suffix;

export const propertyUpdate =  (prop) => {
    const objProp =  `${Object.keys(prop)[0]} = ${Object.values(prop)[0]}`
    return objProp
}

const value = sqlresponse => sqlresponse[0][0].row_to_json;
const row_value  = sqlresponse => sqlresponse[0][0].json_agg;
const sqlString  = v => `'${v.toString()}'`


const sqlSafe = (val, record = false) => Array.isArray(val) ? `'{${val.map(q => q).join(",")}}'`
    : typeof (val) == 'string' ?
        record ? sanitize(val)
            : sqlString(sanitize(val))
        : val;

const sqlValues = obj => Object.values(obj).map(v => sqlSafe(v, true)).join(",")
const sqlConditions = (obj, op = "or") => Object.entries(obj).map( kv => `${kv[0]} = ${sqlValues(kv[1])}`).join(` ${op} `)

export const pg_read_simple = async(typename, object) => row_value(await pgsql.query(`Select json_agg(${typename}) from ${schema}.${typename}
                                                                                  ${object != null ? `where ${sqlConditions(object)}` : ''}`))

export const pg_insert = async(typename, object) =>  value( await pgsql.query(`Insert into ${schema}.${typename} (${Object.keys(object).join(",")})
                                                                       Values(${sqlValues(object)})
                                                                       returning row_to_json(${typename}.*)`))

export const pg_update = async(typename, object, keyfield=null, keyprops={}) => await pgsql.query(`Update ${typename} set ${Object.entries(object).map((q,i)=> propertyUpdate(q)).join(",")} where ${keyfield != null ? `${keyfield}=${object[keyfield]}` : `${propertyUpdate(q).join(" and ")}` }`)

export const linkChildToParent = async( childTypeName, parentTypeName, child, parent) => {

    const childTypeArray =  typeLinkArray(childTypeName);
    parent[childTypeArray] =  parent[childTypeArray] ?? [];
    parent[childTypeArray].push(child.id);
    
    await pg_update(parentTypeName, parent, null, parent)
}

export const unlinkChildFromParent = async(childTypeName, parentTypeName, child, parent) => {

    const childTypeArray =  typeLinkArray(childTypeName);
    parent[childTypeArray].splice(parent[childTypeArray].indexOf(child.id));
    await pg_update(parentTypeName, parent, null, parent)
}