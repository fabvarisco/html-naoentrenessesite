const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());
app.use(express.static('.')); 

app.post('/api/visit', async (req, res) => {
    try {
        const { data: currentData, error: fetchError } = await supabase
            .from('visitors')
            .select('count')
            .eq('id', 1)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
        }

        let newCount = 1;

        if (currentData) {
            newCount = currentData.count + 1;
            const { error: updateError } = await supabase
                .from('visitors')
                .update({ count: newCount, updated_at: new Date() })
                .eq('id', 1);

            if (updateError) throw updateError;
        } else {
            const { error: insertError } = await supabase
                .from('visitors')
                .insert({ id: 1, count: 1, updated_at: new Date() });

            if (insertError) throw insertError;
        }

        res.json({ count: newCount });
    } catch (error) {
        console.error('Erro ao processar visita:', error);
        res.status(500).json({ error: 'Erro ao processar visita' });
    }
});

app.get('/api/count', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('visitors')
            .select('count')
            .eq('id', 1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.json({ count: 0 });
            }
            throw error;
        }

        res.json({ count: data.count || 0 });
    } catch (error) {
        console.error('Erro ao buscar contador:', error);
        res.status(500).json({ error: 'Erro ao buscar contador' });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 API disponível em http://localhost:${PORT}/api/visit`);
});
