const express = require('express')
const joyas = require('./data/joyas.js')
const app = express()
app.listen(3000, () => console.log('Your app listening on port 3000'))

function HATEOAS(){
  let data = joyas.results.map((j) => {
    return {
      name: j.name,
      href: `http://localhost:3000/joya/${j.id}`,
    };
  });
  return data;
}

function HATEOASV2(){
  let data = joyas.results.map((j) => {
    return {
      name: j.name,
      src: `http://localhost:3000/joya/${j.id}`,
    };
  });
  return data;
}

function orderValues(order){
  if(order == 'asc')
    return joyas.results.sort((a,b) => (a.value > b.value ? 1 : -1));
  if(order == 'desc')
    return joyas.results.sort((a,b) => (a.value < b.value ? 1 : -1));
}

function joya(id){
  return joyas.results.filter((joya) => joya.id === id)
}

function fieldsSelect(joya, fields){
let Fields = fields.split(',');
let properties = Object.keys(joya);
let check = true;
Fields.forEach(field => {
  if(properties.includes(field))
    check = false;
});
if(!check){
  return {
    error: '404',
    message: 'Alguno de los campos que consulta no existe',
  };
}
else{
  let joyaFiltrada = joya;
  for(field in joyaFiltrada){
    if(!Fields.includes(field))
    delete joyaFiltrada[field];
  }
  return joyaFiltrada;
}
}

function filtroCategory(category){
  return joyas.results.filter((j) =>{
    return j.category === category;
  });
}

app.get('/api/v1/joyas', (req, res) => {
  res.send({
    joyas: HATEOAS(),
  });
});

app.get('/api/v2/joyas', (req, res) => {
if(req.query.values == 'asc')
  return res.send(orderValues('asc'));
if(req.query.values == 'desc')
  return res.send(orderValues('desc'));
if(req.query.page){
  let page = parseInt(req.query.page);
  let start = page * 2 - 2;
  let end = page * 2;
  return res.send({ joyas: HATEOASV2().slice(start, end) });
}
  res.send({
    joyas: HATEOASV2(),
  });
});

app.get('/joya/:id', (req, res) => {
  const id = parseInt(req.params.id);
  res.send({
    joya: joya(id)[0],
  });
});

app.get('/api/v2/joyas/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if(req.query.Fields)
    return res.send(fieldsSelect(joya(id)[0], req.query.fields))
  joya(id)[0]
  ? res.send({ 
    joya: joya(id)[0],
  })
  : res.send({
    error: '404',
    message: 'No existe el ID de la joya',
  });
});

app.get('/api/v2/Category/:category', (req, res) => {
  const category = req.params.category;
  res.send({
    cant: filtroCategory(category).length,
    joyas: filtroCategory(category),
  });
})

app.get('/', (req, res) => {
  res.send('Oh wow! this is working =)')
})