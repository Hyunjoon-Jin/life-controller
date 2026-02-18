-- Create project_resources table
CREATE TABLE IF NOT EXISTS public.project_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT,
    type TEXT CHECK (type IN ('link', 'file', 'image', 'video')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create wiki_pages table
CREATE TABLE IF NOT EXISTS public.wiki_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create project_risks table
CREATE TABLE IF NOT EXISTS public.project_risks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT CHECK (status IN ('identified', 'mitigated', 'resolved')),
    mitigation_plan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.project_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_risks ENABLE ROW LEVEL SECURITY;

-- Create policies (permissive for now, mirroring existing pattern)
CREATE POLICY "Users can view their own project resources" ON public.project_resources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own project resources" ON public.project_resources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own project resources" ON public.project_resources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own project resources" ON public.project_resources FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own wiki pages" ON public.wiki_pages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own wiki pages" ON public.wiki_pages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own wiki pages" ON public.wiki_pages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wiki pages" ON public.wiki_pages FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own project risks" ON public.project_risks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own project risks" ON public.project_risks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own project risks" ON public.project_risks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own project risks" ON public.project_risks FOR DELETE USING (auth.uid() = user_id);
