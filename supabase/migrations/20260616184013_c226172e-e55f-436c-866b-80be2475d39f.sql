CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.identities (user_id, name, role, description, specialty, color, status, energy, persona) VALUES
    (NEW.id, 'El Estratega', 'Planificador Principal', 'Visión a largo plazo y decisiones estratégicas', 'Estrategia', 'emerald', 'active', 88, 'strategist'),
    (NEW.id, 'El Creativo', 'Director de Innovación', 'Genera ideas originales y soluciones creativas', 'Creatividad', 'violet', 'resting', 72, 'creator'),
    (NEW.id, 'El Organizador', 'Gestor de Procesos', 'Mantiene todo estructurado y funcionando', 'Organización', 'sky', 'active', 80, 'analyst'),
    (NEW.id, 'El Coach', 'Bienestar Personal', 'Cuida del equilibrio emocional y la motivación', 'Bienestar', 'amber', 'resting', 90, 'caregiver');

  RETURN NEW;
END;
$function$;