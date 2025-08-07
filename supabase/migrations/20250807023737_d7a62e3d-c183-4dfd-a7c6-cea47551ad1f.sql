-- Create assessments table
CREATE TABLE assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('in_progress', 'completed', 'abandoned')) DEFAULT 'in_progress',
  current_question INTEGER DEFAULT 0,
  responses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can manage own assessments" ON assessments
  FOR ALL USING (auth.uid() = user_id);

-- Create responses table for individual responses
CREATE TABLE assessment_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  response_text TEXT,
  response_audio_url TEXT,
  response_type TEXT CHECK (response_type IN ('voice', 'text')) DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policy  
CREATE POLICY "Users can view own responses" ON assessment_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE assessments.id = assessment_responses.assessment_id 
      AND assessments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own responses" ON assessment_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE assessments.id = assessment_responses.assessment_id 
      AND assessments.user_id = auth.uid()
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for assessments
CREATE TRIGGER update_assessments_updated_at
    BEFORE UPDATE ON assessments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();