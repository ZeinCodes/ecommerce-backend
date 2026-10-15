-- Placeholder images are for local/demo use. Replace them with your own Cloudinary URLs if desired.
-- The NOT EXISTS check prevents duplicates because product_images has no natural unique constraint.
INSERT INTO product_images (product_id, image_url)
SELECT p.id, seed.image_url
FROM (
    VALUES
        ('LAP-DELL-001', 'https://placehold.co/800x600/png?text=Dell+Inspiron+15'),
        ('PHN-SAM-001', 'https://placehold.co/800x600/png?text=Samsung+Galaxy+S25'),
        ('ACC-KEY-001', 'https://placehold.co/800x600/png?text=Mechanical+Keyboard'),
        ('RUN-NIK-001', 'https://placehold.co/800x600/png?text=Running+Shoes'),
        ('FUR-CHR-001', 'https://placehold.co/800x600/png?text=Office+Chair'),
        ('KIT-AFR-001', 'https://placehold.co/800x600/png?text=Air+Fryer')
) AS seed(sku, image_url)
JOIN products p
  ON p.sku = seed.sku
 AND p.deleted_at IS NULL
WHERE NOT EXISTS (
    SELECT 1
    FROM product_images existing
    WHERE existing.product_id = p.id
      AND existing.image_url = seed.image_url
);
