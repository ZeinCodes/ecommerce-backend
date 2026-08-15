INSERT INTO products (
    category_id,
    name,
    description,
    price,
    stock,
    sku
)
VALUES

-- Laptops
(
    'fe4068d1-aef8-4b3f-a3db-7d0b0c0e9284',
    'Dell Inspiron 15',
    '15-inch laptop suitable for everyday work and study',
    699.99,
    25,
    'LAP-DELL-001'
),
(
    'fe4068d1-aef8-4b3f-a3db-7d0b0c0e9284',
    'Lenovo ThinkPad E14',
    'Business laptop with excellent keyboard and performance',
    849.99,
    18,
    'LAP-LEN-001'
),
(
    'fe4068d1-aef8-4b3f-a3db-7d0b0c0e9284',
    'ASUS ROG Strix G16',
    'Gaming laptop with high performance hardware',
    1499.99,
    10,
    'LAP-ASUS-001'
),

-- Smartphones
(
    '1fad9b6c-dce6-4d48-b6e9-428fcce1029d',
    'Samsung Galaxy S25',
    'Flagship Android smartphone',
    899.99,
    30,
    'PHN-SAM-001'
),
(
    '1fad9b6c-dce6-4d48-b6e9-428fcce1029d',
    'Google Pixel 10',
    'Google flagship smartphone with advanced camera',
    799.99,
    20,
    'PHN-GOO-001'
),
(
    '1fad9b6c-dce6-4d48-b6e9-428fcce1029d',
    'iPhone 17',
    'Apple smartphone with modern performance and camera',
    999.99,
    35,
    'PHN-APP-001'
),

-- Tablets
(
    '17c70043-413a-41af-b744-b6b3eed3b2fe',
    'iPad Air',
    'Lightweight tablet for work, study and entertainment',
    699.99,
    22,
    'TAB-APP-001'
),
(
    '17c70043-413a-41af-b744-b6b3eed3b2fe',
    'Samsung Galaxy Tab S10',
    'Premium Android tablet',
    749.99,
    15,
    'TAB-SAM-001'
),

-- Computer Accessories
(
    'ee396666-1e29-47fe-8fa9-f393686215b6',
    'Mechanical Gaming Keyboard',
    'RGB mechanical keyboard for gaming and programming',
    79.99,
    50,
    'ACC-KEY-001'
),
(
    'ee396666-1e29-47fe-8fa9-f393686215b6',
    'Wireless Gaming Mouse',
    'Low-latency wireless gaming mouse',
    59.99,
    45,
    'ACC-MOU-001'
),
(
    'ee396666-1e29-47fe-8fa9-f393686215b6',
    'USB-C Hub',
    'Multi-port USB-C hub for laptops',
    39.99,
    60,
    'ACC-HUB-001'
),

-- Men Clothing
(
    'cddf301a-7930-4988-bb8c-a4554b02ae93',
    'Classic Cotton T-Shirt',
    'Comfortable everyday cotton t-shirt',
    24.99,
    100,
    'MEN-TSH-001'
),
(
    'cddf301a-7930-4988-bb8c-a4554b02ae93',
    'Slim Fit Jeans',
    'Modern slim fit denim jeans',
    59.99,
    70,
    'MEN-JEA-001'
),

-- Women Clothing
(
    '72beb981-b411-4f1f-8611-b0d13bff9f49',
    'Women Casual Dress',
    'Elegant casual dress for everyday use',
    49.99,
    60,
    'WOM-DRS-001'
),
(
    '72beb981-b411-4f1f-8611-b0d13bff9f49',
    'Women Denim Jacket',
    'Classic denim jacket',
    69.99,
    40,
    'WOM-JAC-001'
),

-- Kids Clothing
(
    '776f87ce-d55b-45c2-86c4-22e6528c8c62',
    'Kids Cotton Hoodie',
    'Warm cotton hoodie for children',
    34.99,
    55,
    'KID-HOD-001'
),
(
    '776f87ce-d55b-45c2-86c4-22e6528c8c62',
    'Kids Summer Shorts',
    'Lightweight summer shorts',
    19.99,
    80,
    'KID-SHO-001'
),

-- Running Shoes
(
    '945d0090-6a31-4a1b-9f5f-8b613c9c8b4e',
    'Nike Pegasus',
    'Lightweight running shoes for daily training',
    129.99,
    35,
    'RUN-NIK-001'
),
(
    '945d0090-6a31-4a1b-9f5f-8b613c9c8b4e',
    'Adidas Ultraboost',
    'Comfortable running shoes with responsive cushioning',
    159.99,
    25,
    'RUN-ADI-001'
),

-- Casual Shoes
(
    '4d6e7221-111d-4542-8b93-219c994ce602',
    'Classic White Sneakers',
    'Minimal everyday sneakers',
    69.99,
    50,
    'CAS-SNK-001'
),
(
    '4d6e7221-111d-4542-8b93-219c994ce602',
    'Leather Casual Shoes',
    'Premium leather casual shoes',
    99.99,
    30,
    'CAS-LTH-001'
),

-- Furniture
(
    'b95e9a49-f437-4c97-b1c6-f07c714b1387',
    'Modern Office Desk',
    'Spacious desk suitable for home offices',
    249.99,
    15,
    'FUR-DSK-001'
),
(
    'b95e9a49-f437-4c97-b1c6-f07c714b1387',
    'Ergonomic Office Chair',
    'Adjustable ergonomic chair for long work sessions',
    299.99,
    12,
    'FUR-CHR-001'
),

-- Home Decor
(
    '1a96a3dc-6f47-49db-bff9-758e7197789b',
    'Modern Wall Clock',
    'Minimal modern wall clock',
    34.99,
    40,
    'DEC-CLK-001'
),
(
    '1a96a3dc-6f47-49db-bff9-758e7197789b',
    'Decorative Table Lamp',
    'Modern decorative lamp for home interiors',
    44.99,
    35,
    'DEC-LMP-001'
),

-- Kitchen Appliances
(
    '5fb1af17-d038-4c0f-9bb3-63624e39faa9',
    'Air Fryer',
    'Digital air fryer with multiple cooking modes',
    89.99,
    25,
    'KIT-AFR-001'
),
(
    '5fb1af17-d038-4c0f-9bb3-63624e39faa9',
    'Electric Blender',
    'High-speed blender for smoothies and food preparation',
    59.99,
    30,
    'KIT-BLD-001'
),

-- Fiction Books
(
    '9117b9b1-b7ea-4c4a-8eb3-bc046425b681',
    'The Silent Mystery',
    'A fictional mystery novel',
    14.99,
    100,
    'FIC-BOK-001'
),
(
    '9117b9b1-b7ea-4c4a-8eb3-bc046425b681',
    'The Lost Kingdom',
    'Fantasy adventure novel',
    17.99,
    75,
    'FIC-BOK-002'
),

-- Educational Books
(
    'fff3c3dc-50a4-4c65-9335-5dc6ce297007',
    'Learning JavaScript',
    'Practical introduction to modern JavaScript',
    29.99,
    50,
    'EDU-JS-001'
),
(
    'fff3c3dc-50a4-4c65-9335-5dc6ce297007',
    'PostgreSQL Fundamentals',
    'Guide to PostgreSQL and relational databases',
    34.99,
    40,
    'EDU-DB-001'
),

-- Gaming
(
    '64e1ea2d-9045-49cb-b309-2bfe9c39c69b',
    'Gaming Controller',
    'Wireless controller for PC gaming',
    59.99,
    40,
    'GAM-CON-001'
),
(
    '64e1ea2d-9045-49cb-b309-2bfe9c39c69b',
    'Gaming Headset',
    'Surround sound gaming headset with microphone',
    89.99,
    35,
    'GAM-HED-001'
),

-- Fitness Equipment
(
    'ad8c1781-4a88-40c1-b47f-815c5a869b89',
    'Adjustable Dumbbells',
    'Adjustable dumbbells for home workouts',
    149.99,
    20,
    'FIT-DUM-001'
),
(
    'ad8c1781-4a88-40c1-b47f-815c5a869b89',
    'Resistance Bands Set',
    'Set of resistance bands for strength training',
    29.99,
    60,
    'FIT-BND-001'
),

-- Skincare
(
    '4e72e0da-33f3-4a67-a652-41da037b4915',
    'Gentle Face Cleanser',
    'Daily facial cleanser for normal skin',
    19.99,
    80,
    'SKN-CLN-001'
),
(
    '4e72e0da-33f3-4a67-a652-41da037b4915',
    'Moisturizing Cream',
    'Daily moisturizing cream',
    24.99,
    70,
    'SKN-MST-001'
),

-- Perfumes
(
    '98a79012-5581-4923-8248-22d4a0894d7e',
    'Woody Eau de Parfum',
    'Warm woody fragrance',
    79.99,
    40,
    'PRF-WOD-001'
),
(
    '98a79012-5581-4923-8248-22d4a0894d7e',
    'Fresh Citrus Eau de Parfum',
    'Fresh citrus fragrance for everyday use',
    69.99,
    45,
    'PRF-CIT-001'
),

-- Watches
(
    'd9c8c47b-bfed-459e-8f2b-161c37bf6a81',
    'Classic Analog Watch',
    'Classic stainless steel analog watch',
    119.99,
    25,
    'WAT-ANA-001'
),
(
    'd9c8c47b-bfed-459e-8f2b-161c37bf6a81',
    'Digital Sports Watch',
    'Digital watch designed for sports and outdoor activities',
    89.99,
    35,
    'WAT-DIG-001'
),

-- Jewelry
(
    'c4ed715e-e978-4753-8e3c-f0047c1d00ee',
    'Silver Necklace',
    'Simple sterling silver necklace',
    59.99,
    30,
    'JWL-NCK-001'
),
(
    'c4ed715e-e978-4753-8e3c-f0047c1d00ee',
    'Classic Bracelet',
    'Elegant minimalist bracelet',
    44.99,
    40,
    'JWL-BRC-001'
);