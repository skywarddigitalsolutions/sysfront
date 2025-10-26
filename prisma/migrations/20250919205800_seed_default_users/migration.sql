-- CreateDefaultUsers
-- Insert default users for the application

INSERT INTO "User" (id, username, password, role, "createdAt", "updatedAt") VALUES
  ('admin_user_id_001', 'admin', 'admin', 'ADMIN', NOW(), NOW()),
  ('caja_user_id_002', 'caja', 'caja', 'CAJA', NOW(), NOW()),
  ('cocina_user_id_003', 'cocina', 'cocina', 'COCINA', NOW(), NOW())
ON CONFLICT (username) DO NOTHING;
