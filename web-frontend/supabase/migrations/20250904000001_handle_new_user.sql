-- This function runs every time a new user signs up.
-- It copies the user's ID, email, and role from the auth.users table
-- into the public.users table.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, name, phone, role)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'role'
  );
  return new;
end;
$$;

-- This trigger calls the function after a new user is created.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
