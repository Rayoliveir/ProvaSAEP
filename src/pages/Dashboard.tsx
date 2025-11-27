import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Package, 
  FileText, 
  ClipboardList, 
  TrendingUp,
  AlertTriangle
} from "lucide-react";

interface Stats {
  customersCount: number;
  productsCount: number;
  quotesCount: number;
  serviceOrdersCount: number;
  activeOrders: number;
  lowStockProducts: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    customersCount: 0,
    productsCount: 0,
    quotesCount: 0,
    serviceOrdersCount: 0,
    activeOrders: 0,
    lowStockProducts: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [customers, products, quotes, serviceOrders, activeOrders, lowStock] = await Promise.all([
      supabase.from("customers").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase.from("products").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase.from("quotes").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase.from("service_orders").select("id", { count: "exact" }).eq("user_id", user.id),
      supabase
        .from("service_orders")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)
        .in("status", ["pending", "in_progress", "waiting_parts"]),
      supabase
        .from("products")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)
        .lte("quantity", 5),
    ]);

    setStats({
      customersCount: customers.count || 0,
      productsCount: products.count || 0,
      quotesCount: quotes.count || 0,
      serviceOrdersCount: serviceOrders.count || 0,
      activeOrders: activeOrders.count || 0,
      lowStockProducts: lowStock.count || 0,
    });
  };

  const statCards = [
    {
      title: "Clientes",
      value: stats.customersCount,
      icon: Users,
      description: "Total de clientes cadastrados",
      color: "from-cornflower-ocean to-baltic-blue",
    },
    {
      title: "Produtos",
      value: stats.productsCount,
      icon: Package,
      description: "Itens no estoque",
      color: "from-steel-blue to-cornflower-ocean",
    },
    {
      title: "Orçamentos",
      value: stats.quotesCount,
      icon: FileText,
      description: "Total de orçamentos",
      color: "from-pumpkin-spice to-harvest-orange",
    },
    {
      title: "Ordens de Serviço",
      value: stats.serviceOrdersCount,
      icon: ClipboardList,
      description: "Total de OS",
      color: "from-harvest-orange to-sandy-brown",
    },
    {
      title: "OS Ativas",
      value: stats.activeOrders,
      icon: TrendingUp,
      description: "Em andamento",
      color: "from-steel-azure to-baltic-blue",
    },
    {
      title: "Estoque Baixo",
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      description: "Produtos com baixo estoque",
      color: "from-destructive to-pumpkin-spice",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do seu negócio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`h-2 bg-gradient-to-r ${card.color}`} />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Nenhuma atividade recente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lembretes</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.lowStockProducts > 0 && (
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle size={16} />
                <span className="text-sm">
                  {stats.lowStockProducts} produto(s) com estoque baixo
                </span>
              </div>
            )}
            {stats.activeOrders > 0 && (
              <div className="flex items-center gap-2 text-pumpkin-spice mt-2">
                <TrendingUp size={16} />
                <span className="text-sm">
                  {stats.activeOrders} ordem(ns) de serviço ativa(s)
                </span>
              </div>
            )}
            {stats.lowStockProducts === 0 && stats.activeOrders === 0 && (
              <p className="text-muted-foreground text-sm">Nenhum lembrete</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
