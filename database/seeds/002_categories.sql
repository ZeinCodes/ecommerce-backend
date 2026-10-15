-- Idempotent by active category name. Product seeds resolve categories by name.
INSERT INTO categories (name)
VALUES
('Laptops'),
('Smartphones'),
('Tablets'),
('Computer Accessories'),
('Men Clothing'),
('Women Clothing'),
('Kids Clothing'),
('Running Shoes'),
('Casual Shoes'),
('Furniture'),
('Home Decor'),
('Kitchen Appliances'),
('Fiction Books'),
('Educational Books'),
('Gaming'),
('Fitness Equipment'),
('Skincare'),
('Perfumes'),
('Watches'),
('Jewelry')
ON CONFLICT (name) WHERE deleted_at IS NULL
DO UPDATE SET updated_at = NOW();
