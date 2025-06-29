-- 🚀 Rode ESTE script em vez do 001; ele não requer permissões administrativas.

-- ---------- TAREFAS -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly')) NOT NULL,
    points INTEGER DEFAULT 10,
    completed BOOLEAN DEFAULT FALSE,
    last_completed TIMESTAMPTZ,
    next_due TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- RECOMPENSAS --------------------------------------------
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    cost INTEGER NOT NULL,
    claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- ESTATÍSTICAS -------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    total_points INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- RLS  ----------------------------------------------------
ALTER TABLE public.tasks   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Policies: TASKS
CREATE POLICY IF NOT EXISTS "select_own_tasks"  ON public.tasks   FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "insert_own_tasks"  ON public.tasks   FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "update_own_tasks"  ON public.tasks   FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "delete_own_tasks"  ON public.tasks   FOR DELETE USING (auth.uid() = user_id);

-- Policies: REWARDS
CREATE POLICY IF NOT EXISTS "select_own_rewards" ON public.rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "insert_own_rewards" ON public.rewards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "update_own_rewards" ON public.rewards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "delete_own_rewards" ON public.rewards FOR DELETE USING (auth.uid() = user_id);

-- Policies: USER_STATS
CREATE POLICY IF NOT EXISTS "select_own_stats"  ON public.user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "insert_own_stats"  ON public.user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "update_own_stats"  ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);

-- ---------- ÍNDICES -------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_tasks_user_id      ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed    ON public.tasks(completed);
CREATE INDEX IF NOT EXISTS idx_rewards_user_id    ON public.rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_claimed    ON public.rewards(claimed);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);
