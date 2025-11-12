"use client";
import * as React from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users } from "./client-details";

type CostCardProps = {
  item: Users | null;
  setModalInfo: any;
};

export function User_Card({ ...props }: CostCardProps) {
  const [inputsData, setInputsData] = React.useState(
    props.item ?? {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      id: null,
    }
  );

  console.log(inputsData);
  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/15">
      <Card className="w-[423px]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {props.item == null ? "New" : "Edit"} User
            <X
              className="w-4 h-4 text-[#71717a] cursor-pointer"
              onClick={() => {
                props.setModalInfo({
                  isOpen: false,
                  item: null,
                });
              }}
            />
          </CardTitle>
          <CardDescription>
            Fill in the details below to{" "}
            {props.item == null ? "register a new" : "edit a"} user.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  placeholder="First name..."
                  value={inputsData.first_name}
                  onChange={(e) =>
                    setInputsData((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        first_name: e.target.value,
                      };
                    })
                  }
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  placeholder="Last name..."
                  value={inputsData.last_name}
                  onChange={(e) =>
                    setInputsData((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        last_name: e.target.value,
                      };
                    })
                  }
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="Enter your email..."
                  value={inputsData.email}
                  onChange={(e) =>
                    setInputsData((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        email: e.target.value,
                      };
                    })
                  }
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="phone_number">Phone</Label>
                <Input
                  id="phone_number"
                  placeholder="Enter phone number..."
                  value={inputsData.phone}
                  onChange={(e) =>
                    setInputsData((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        phone: e.target.value,
                      };
                    })
                  }
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex items-center gap-4 self-end">
          <Button
            variant="outline"
            onClick={() => {
              props.setModalInfo({
                isOpen: false,
                item: null,
              });
            }}
          >
            Cancel
          </Button>
          <Button type="submit" className="w-[137px] bg-[#0283fa]">
            {props.item == null ? "Add" : "Edit"} user
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
