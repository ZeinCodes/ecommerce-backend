-- Product rows refer to active categories by name; no category UUIDs are hard-coded.
-- Stock for four products reflects the two sample orders seeded later in this pack.
INSERT INTO products (
    category_id, name, description, price, stock, sku
)
SELECT
    c.id,
    seed.name,
    seed.description,
    seed.price,
    seed.stock,
    seed.sku
FROM (
VALUES
('Laptops', 'Dell Inspiron 15', '15-inch laptop suitable for everyday work and study', 699.99, 24, 'LAP-DELL-001'),
('Laptops', 'Lenovo ThinkPad E14', 'Business laptop with a comfortable keyboard and dependable performance', 849.99, 18, 'LAP-LEN-001'),
('Laptops', 'ASUS ROG Strix G16', 'High-performance gaming laptop', 1499.99, 10, 'LAP-ASUS-001'),
('Smartphones', 'Samsung Galaxy S25', 'Flagship Android smartphone', 899.99, 29, 'PHN-SAM-001'),
('Smartphones', 'Google Pixel 10', 'Android smartphone with an advanced camera', 799.99, 20, 'PHN-GOO-001'),
('Smartphones', 'iPhone 17', 'Apple smartphone with modern performance and camera features', 999.99, 35, 'PHN-APP-001'),
('Tablets', 'iPad Air', 'Lightweight tablet for work, study and entertainment', 699.99, 22, 'TAB-APP-001'),
('Tablets', 'Samsung Galaxy Tab S10', 'Premium Android tablet', 749.99, 15, 'TAB-SAM-001'),
('Computer Accessories', 'Mechanical Gaming Keyboard', 'RGB mechanical keyboard for gaming and programming', 79.99, 50, 'ACC-KEY-001'),
('Computer Accessories', 'Wireless Gaming Mouse', 'Low-latency wireless mouse', 59.99, 45, 'ACC-MOU-001'),
('Computer Accessories', 'USB-C Hub', 'Multi-port USB-C hub for compatible laptops', 39.99, 58, 'ACC-HUB-001'),
('Men Clothing', 'Classic Cotton T-Shirt', 'Comfortable everyday cotton t-shirt', 24.99, 100, 'MEN-TSH-001'),
('Men Clothing', 'Slim Fit Jeans', 'Modern slim-fit denim jeans', 59.99, 70, 'MEN-JEA-001'),
('Women Clothing', 'Women Casual Dress', 'Casual dress for everyday wear', 49.99, 60, 'WOM-DRS-001'),
('Women Clothing', 'Women Denim Jacket', 'Classic denim jacket', 69.99, 40, 'WOM-JAC-001'),
('Kids Clothing', 'Kids Cotton Hoodie', 'Warm cotton hoodie for children', 34.99, 55, 'KID-HOD-001'),
('Kids Clothing', 'Kids Summer Shorts', 'Lightweight summer shorts', 19.99, 80, 'KID-SHO-001'),
('Running Shoes', 'Nike Pegasus', 'Lightweight running shoes for daily training', 129.99, 35, 'RUN-NIK-001'),
('Running Shoes', 'Adidas Ultraboost', 'Running shoes with responsive cushioning', 159.99, 25, 'RUN-ADI-001'),
('Casual Shoes', 'Classic White Sneakers', 'Minimal everyday sneakers', 69.99, 50, 'CAS-SNK-001'),
('Casual Shoes', 'Leather Casual Shoes', 'Leather shoes for smart-casual wear', 99.99, 30, 'CAS-LTH-001'),
('Furniture', 'Modern Office Desk', 'Spacious desk for a home office', 249.99, 15, 'FUR-DSK-001'),
('Furniture', 'Ergonomic Office Chair', 'Adjustable ergonomic chair for work sessions', 299.99, 12, 'FUR-CHR-001'),
('Home Decor', 'Modern Wall Clock', 'Minimal wall clock for home interiors', 34.99, 40, 'DEC-CLK-001'),
('Home Decor', 'Decorative Table Lamp', 'Contemporary table lamp', 44.99, 35, 'DEC-LMP-001'),
('Kitchen Appliances', 'Air Fryer', 'Digital air fryer with multiple cooking modes', 89.99, 24, 'KIT-AFR-001'),
('Kitchen Appliances', 'Electric Blender', 'High-speed blender for smoothies and food preparation', 59.99, 30, 'KIT-BLD-001'),
('Fiction Books', 'The Silent Mystery', 'A fictional mystery novel', 14.99, 100, 'FIC-BOK-001'),
('Fiction Books', 'The Lost Kingdom', 'Fantasy adventure novel', 17.99, 75, 'FIC-BOK-002'),
('Educational Books', 'Learning JavaScript', 'Practical introduction to modern JavaScript', 29.99, 50, 'EDU-JS-001'),
('Educational Books', 'PostgreSQL Fundamentals', 'Practical guide to relational databases', 34.99, 40, 'EDU-DB-001'),
('Gaming', 'Gaming Controller', 'Wireless controller for PC gaming', 59.99, 40, 'GAM-CON-001'),
('Gaming', 'Gaming Headset', 'Gaming headset with microphone', 89.99, 35, 'GAM-HED-001'),
('Fitness Equipment', 'Adjustable Dumbbells', 'Adjustable dumbbells for home workouts', 149.99, 20, 'FIT-DUM-001'),
('Fitness Equipment', 'Resistance Bands Set', 'Resistance bands for strength training', 29.99, 60, 'FIT-BND-001'),
('Skincare', 'Gentle Face Cleanser', 'Daily facial cleanser', 19.99, 80, 'SKN-CLN-001'),
('Skincare', 'Moisturizing Cream', 'Daily moisturizing cream', 24.99, 70, 'SKN-MST-001'),
('Perfumes', 'Woody Eau de Parfum', 'Warm woody fragrance', 79.99, 40, 'PRF-WOD-001'),
('Perfumes', 'Fresh Citrus Eau de Parfum', 'Fresh citrus fragrance for everyday use', 69.99, 45, 'PRF-CIT-001'),
('Watches', 'Classic Analog Watch', 'Classic stainless-steel analog watch', 119.99, 25, 'WAT-ANA-001'),
('Watches', 'Digital Sports Watch', 'Digital watch for sports and outdoor activities', 89.99, 35, 'WAT-DIG-001'),
('Jewelry', 'Silver Necklace', 'Minimal sterling-silver necklace', 59.99, 30, 'JWL-NCK-001'),
('Jewelry', 'Classic Bracelet', 'Minimalist bracelet', 44.99, 40, 'JWL-BRC-001')
) AS seed(category_name, name, description, price, stock, sku)
JOIN categories c
  ON c.name = seed.category_name
 AND c.deleted_at IS NULL
WHERE TRUE
ON CONFLICT (sku) WHERE deleted_at IS NULL
DO UPDATE SET
    category_id = EXCLUDED.category_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    stock = EXCLUDED.stock,
    updated_at = NOW();
