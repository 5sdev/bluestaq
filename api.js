import * as http from 'http'
import * as domain from './domain_notes.js';
import { users, notes } from './domain_constants.js';

const endsWith = (str, check) =>  check.IndexOf(str) == check.length - str.length;  

Object.prototype.endsWith = endsWith;

const methods = {
 POST : "POST",
 GET  : "GET",
 DELETE: "DELETE",
 QUERY : ["SEARCH", "QUERY"]
}

const specificNote = new RegExp(String.raw`${notes}\/([\d]+)`)
const specificUser =  new RegExp(String.raw`${users}\/([\d]+)`)
const userNotes = new RegExp(String.raw`${users}\/([\d]+)\/${notes}`)
const specificUserNote = new RegExp(String.raw`${users}\/([\d]+)\/${notes}\/([\d]+)`)
                      

const failure = async (res, statusReason = "Err, didn't catch that", statusCode = 404, panicOnError =  true) =>{
    console.log(statusCode, statusReason)

    if(!res.headersSent && !res._header?.includes(statusReason))
    await res.writeHead(statusCode, statusReason)
    if(panicOnError){
        res.end()
    }
    return;
}

export const server =  http.createServer(async (req, res) => {
    let method =  req.method;
    let path = decodeURI(req.url)
    let routeHandlers = {};

    //#region RouteHandlers

    routeHandlers[userNotes] = {
                                      retrieve: (user) =>  domain.fetchNotes(user), 
                                      create: domain.createUserNote, 
                        
    }

    routeHandlers[specificUserNote] = {
        create: domain.patchUserNote
    }


    routeHandlers[(pt) => pt.endsWith(notes)] =  {
            retrieve: domain.fetchNotes,
            create: domain.createNote,      
    }
       routeHandlers[(pt) => pt.endsWith(users)] =  {
            create: domain.createUser,      
    }


    //#endregion

    let routeProxy = {
        get(target, prop, receiver){
            try{ 
            return Object.entries(target).filter( 
                kv => {

                     let keyinstance =  eval(kv[0]); 

                     return  keyinstance instanceof Function  ? keyinstance(prop) 
                           : keyinstance instanceof RegExp    ? prop.match(new RegExp(kv[0].slice(1, kv[0].length-1))) 
                           : keyinstance instanceof String    ? prop.match(keyinstance)
                           : null
                }
            )[0][1]
            }
            catch(q){
                return failure(res).then(f => f)
            }
        }
    }

    let rh =  new Proxy(routeHandlers, routeProxy)
    
    res.setHeader('content-type', "application/json")

    let [noteMatch, userMatch, userNotesMatch, userNoteMatch ] = [specificNote, specificUser, userNotes, userNotes].map(pc => path.match(pc))

    const [route, requestedResource] = (noteMatch ?? userNotesMatch ?? userMatch ?? userNoteMatch ?? [path, {}]);
    const functionRoute =  !(noteMatch ?? userNoteMatch ?? userMatch)


    const handler = rh[route];

    const  {retrieve, create, remove, parent, child} = handler;


    if(method == methods.GET){
        try{
            let q =  await (functionRoute ? retrieve() 
                                          : retrieve(requestedResource));

            res.writeHead(200).end(Buffer.from(JSON.stringify(q)))
        }
        catch{
            return await failure(res)
        }
    }

    else if(method  ==  methods.POST || method == methods.DELETE){


            let nb = '';
            let op =  methods.POST ? create : remove
            let param; 
            req.on('data', (chnk) => nb += chnk);
            req.on('end', async () => {
                if(!op){
                   return (await failure(res))
                }
                try{
                param =  JSON.parse(nb);
                let q = await (functionRoute || op.name =='patchUserNote' ? op(param) : op(param[parent], param[child]))
                let p = q;
                res.writeHead(200).end(Buffer.from(JSON.stringify(q)))
                }
                catch(q){
              
                    return await failure(res, q.toString(), 418)
                }

            })
    }
    else{
        console.log(method, path)
        return await failure(res)
    }
})

server.maxRequestsPerSocket = 0;

server.listen(12345);
