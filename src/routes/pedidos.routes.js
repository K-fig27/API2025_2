import {Router} from 'express'

//importar las funciones 
import {postPedido,getPedido,getPedidoxID} from '../controladores/pedidosCtrl.js';
const router=Router();
//armar nuestras rutas 
//router.get('/clientes',prueba)
router.get('/pedidos',getPedido)
router.get('/pedidos/:id',getPedidoxID)
router.post('/pedidos',postPedido)
//router.put('/clientes/:id',putCliente)
//router.delete('/clientes/:id', deleteCliente);

export default router 