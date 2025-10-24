import express from 'express'
import dotenv from 'dotenv'
//importar las rutas OJO
import clientesRoutes from './routes/clientes.routes.js';
import productuRoutes from './routes/productos.routes.js';
import autRoutes from './routes/auth.routes.js'; //nueva ruta
import pedidosRoutes from './routes/pedidos.routes.js'

dotenv.config();

const app=express();
app.use(express.json());

// indicar las rutas a utilizar 
app.use('/api/',clientesRoutes)
app.use('/api/', productuRoutes)
app.use('/api/auth', autRoutes)  //login
app.use('/api', pedidosRoutes)


app.use((req,resp,next)=>{
    resp.status(400).json({
        message:'Endpoint not fount'

    })
})

export default app; 