import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Bot, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to BotForge</h1>
          <p className="text-xl text-muted-foreground">
            Create, backtest and generate your own crypto trading bots in minutes
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/strategy-builder">
            <Card className="hover:shadow-lg transition-all cursor-pointer border-primary/20 hover:border-primary/50">
              <CardHeader className="text-center">
                <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Strategy Builder</CardTitle>
                <CardDescription>Create your trading bot with our wizard flow</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link to="/bot-community">
            <Card className="hover:shadow-lg transition-all cursor-pointer border-primary/20 hover:border-primary/50">
              <CardHeader className="text-center">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Bot Community</CardTitle>
                <CardDescription>Share and discover profitable bots</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link to="/my-bots">
            <Card className="hover:shadow-lg transition-all cursor-pointer border-primary/20 hover:border-primary/50">
              <CardHeader className="text-center">
                <Bot className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>My Bots</CardTitle>
                <CardDescription>Manage and download your bots</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Link to="/ai-chat">
            <Card className="hover:shadow-lg transition-all cursor-pointer border-primary/20 hover:border-primary/50">
              <CardHeader className="text-center">
                <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>AI Chat</CardTitle>
                <CardDescription>Get trading strategy assistance</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
