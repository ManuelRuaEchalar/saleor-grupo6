const { pool, initDatabase } = require('./config/db');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function seedDatabase() {
  try {
    await initDatabase();
    console.log('Iniciando seed de la base de datos...');

    // Imágenes únicas para cada producto
    const images = [
      'https://images.philips.com/is/image/philipsconsumer/82297dea811e471aa356b16f00253629?$pnglarge$&wid=1250',
      'https://www.tiendaamiga.com.bo/media/catalog/product/cache/deb88dadd509903c96aaa309d3e790dc/1/2/1279.gif',
      'https://i5.walmartimages.com/seo/Lenovo-Ideapad-5-14-1080p-Touchscreen-Laptop-AMD-Ryzen-7-5700U-8GB-RAM-512GB-SSD-Windows-11Home-Graphite-Grey-82LM00UEUS_bd7e44d5-ecc2-492a-9fe7-56c8599372bd.31d4c74bec047ea8f7dd7939c4e7801b.jpeg',
      'https://cdn.mos.cms.futurecdn.net/FUi2wwNdyFSwShZZ7LaqWf.jpg',
      'https://radiokable.net/wp-content/uploads/2022/03/shutterstock_2074158227-scaled.jpg',
      'https://img.freepik.com/vector-gratis/maqueta-telefono-inteligente-vista-frontal-realista-marco-purpura-iphone-movil-pantalla-blanca-blanco-vector_90220-959.jpg?semt=ais_hybrid&w=740',
      'https://www.jbhifi.com.au/cdn/shop/files/749924-Product-0-I-638518444879246173.jpg?v=1718771850',
      'https://www.boxesonline.pe/wp-content/uploads/2018/05/Smartphone-X-seri-02.jpg',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFimMd6TN2ZzaIjiHdCnnVeSxAxU-BBiMtkA&s',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDNkhx9yiW1YFzKH2n74PsO6P29JtVuNcSHQ&s'
    ];

    // Lista de precios personalizados o aleatorios
    const prices = [12.99, 25.50, 45.00, 19.90, 9.99, 33.33, 15.75, 29.80, 22.49, 17.60];

    // Crear productos con imágenes y precios variados
    const products = images.map((image, i) => ({
      name: `Producto ${i + 1}`,
      description: `Descripción del producto ${i + 1}`,
      price: prices[i],
      image
    }));


    for (const product of products) {
      const [rows] = await pool.query(
        `SELECT * FROM products WHERE name = ?`,
        [product.name]
      );

      if (rows.length === 0) {
        await pool.query(
          `INSERT INTO products (name, description, price, image)
           VALUES (?, ?, ?, ?)`,
          [product.name, product.description, product.price, product.image]
        );
        console.log(`Producto creado: ${product.name}`);
      } else {
        console.log(`El producto ${product.name} ya existe, omitiendo...`);
      }
    }

    const testUser = {
      email: 'usuario@test.com',
      password: '123456'
    };

    const [existingUsers] = await pool.query(
      `SELECT * FROM users WHERE email = ?`,
      [testUser.email]
    );

    let userId;
    if (existingUsers.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testUser.password, salt);

      const [result] = await pool.query(
        `INSERT INTO users (email, password)
         VALUES (?, ?)`,
        [testUser.email, hashedPassword]
      );

      userId = result.insertId;
      console.log(`Usuario creado con ID: ${userId}`);
    } else {
      userId = existingUsers[0].id;
      console.log(`El usuario ${testUser.email} ya existe, ID: ${userId}`);
    }

    const [productRows] = await pool.query(`SELECT id FROM products LIMIT 3`);
    const productIds = productRows.map(row => row.id);

    for (let i = 0; i < 3; i++) {
      const productId = productIds[i];

      const [existingItems] = await pool.query(
        `SELECT * FROM cart_items WHERE userId = ? AND productId = ?`,
        [userId, productId]
      );

      if (existingItems.length === 0) {
        await pool.query(
          `INSERT INTO cart_items (userId, productId, quantity)
           VALUES (?, ?, ?)`,
          [userId, productId, i + 1]
        );
        console.log(`Item añadido al carrito: ProductID: ${productId}, Cantidad: ${i + 1}`);
      } else {
        console.log(`El item ya existe en el carrito: ProductID: ${productId}, omitiendo...`);
      }
    }

    const customers = [
      { name: 'Juan Pérez', email: 'juan.perez@mail.com', phone: '12345678', customer_type: 'regular', notes: 'Cliente frecuente' },
      { name: 'María García', email: 'maria.garcia@mail.com', phone: '87654321', customer_type: 'premium', notes: 'Compra cada mes' },
      { name: 'Carlos López', email: 'carlos.lopez@mail.com', phone: '11223344', customer_type: 'wholesale', notes: 'Cliente mayorista' }
    ];

    for (const customer of customers) {
      const [existing] = await pool.query(
        `SELECT * FROM customers WHERE email = ?`,
        [customer.email]
      );

      if (existing.length === 0) {
        await pool.query(
          `INSERT INTO customers (name, email, phone, customer_type, notes)
          VALUES (?, ?, ?, ?, ?)`,
          [customer.name, customer.email, customer.phone, customer.customer_type, customer.notes]
        );
        console.log(`Cliente creado: ${customer.name}`);
      } else {
        console.log(`El cliente ${customer.email} ya existe, omitiendo...`);
      }
    }

    const tags = ['Ropa', 'Accesorios', 'Electrónica', 'Hogar', 'Belleza'];
    for (const name of tags) {
      await pool.query(`INSERT IGNORE INTO tags (name) VALUES (?)`, [name]);
    }



    console.log('Seed completado con éxito');
    await pool.end();
    console.log('Conexión a la base de datos cerrada');
    process.exit(0);
  } catch (error) {
    console.error('Error durante el seed:', error);
    process.exit(1);
  }
}

seedDatabase();
