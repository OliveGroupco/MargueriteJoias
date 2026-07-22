import { createClient } from "@supabase/supabase-js";

const url = "https://yzhbtjizyfachtfhtfhq.supabase.co";
const key = "sb_publishable_hdbFn5hHTl7bTRL60yvaEg_gFp8F5R9";

const supabase = createClient(url, key);

async function createAdmin() {
  console.log("Tentando criar usuário: ofelipy@outlook.com");
  
  const { data, error } = await supabase.auth.signUp({
    email: "ofelipy@outlook.com",
    password: "Manager2026*",
    options: {
      data: {
        nome: "Admin"
      }
    }
  });

  if (error) {
    console.error("Erro ao criar usuário:", error.message);
    return;
  }

  console.log("Usuário criado com sucesso!");
  console.log("ID do usuário:", data.user?.id);
  
  const { data: roleData, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user?.id)
    .single();
    
  if (roleError) {
    console.error("Erro ao verificar papel (role):", roleError.message);
  } else {
    console.log("Role atribuída:", roleData?.role);
  }
}

createAdmin();
