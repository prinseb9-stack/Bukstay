const supabase = require('./db/supabase')

async function test() {
  const { data, error } = await supabase.from('users').select('*').limit(1)
  console.log('Error:', error)
  console.log('Data:', data)
}

test()