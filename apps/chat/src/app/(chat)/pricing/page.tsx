"use client";

import { useState } from "react";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";
import { useRouter } from "next/navigation";

import { IconButton } from "@/components/button";
import CloseIcon from "@/assets/icons/close.svg";

import Locale from "@/locales";
import styles from "./pricing.module.scss";
import fetcher from "@/utils/fetcher";
import { showToast } from "@/components/ui-lib";

type PlanType = "Free" | "Pro" | "Premium";
type PaymentCycleType = "yearly" | "monthly" | "quarterly";

interface Price {
  name: PlanType;
  description?: string;
  price: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };
  features: string[];
}

const prices: Price[] = [
  {
    name: "Free",
    price: {
      monthly: 0,
      quarterly: 0,
      yearly: 0,
    },
    features: ["每天 10 次 GPT-3.5 免费问答"],
  },
  {
    name: "Pro",
    price: {
      monthly: 39,
      quarterly: 99,
      yearly: 299,
    },
    features: ["每天 200 次 GPT-3.5 问答", "每小时 1 次 GPT-4 问答", "六月福利：每天 10 次 claude-v1.3（公开测评分数大于GPT-3.5，仅次于GPT-4）问答试用"],
  },
  {
    name: "Premium",
    price: {
      monthly: 99,
      quarterly: 229,
      yearly: 799,
    },
    features: [
      "New Bing 免费使用(开发中，即将上线)",
      "GPT-3.5 无限制问答",
      "每小时 5 次 GPT-4 免费问答",
      "六月超级福利：每天 200 次 claude-v1.3（公开测评分数大于GPT-3.5，仅次于GPT-4）问答！"
    ],
  },
];

function PricingItem(props: {
  router: AppRouterInstance;
  cycle: PaymentCycleType;
  price: Price;
}) {

  async function handleUpgrade(plan: PlanType, cycle: PaymentCycleType) {
    const req = await (
      await fetcher(`/api/user/pay?plan=${plan.toLowerCase()}&cycle=${cycle}`, {
        cache: "no-store",
        method: "GET",
      })
    ).json();
    if (!req) return showToast("支付接口配置错误，请联系管理员", 10000);
    const url = req.url;
    props.router.push(url);
  }

  return (
    <div className={styles.list}>
      <div className={styles["list-item"]}>
        <div className={styles.row}>
          <div className={styles["title"]}>{props.price.name}</div>
          {props.price.description && (
            <div className={styles["sub-title"]}>{props.price.description}</div>
          )}
          ¥ {props.price.price[props.cycle]}
        </div>
        {props.price.features.map((feature, index) => (
          <div key={index}>· {feature}</div>
        ))}
      </div>
      {props.price.name !== "Free" && (
        <div className={styles["purchase-wrapper"]}>
          <IconButton
            icon={<span>🎁</span>}
            text={"购买"}
            className={styles["purchase"] + " no-dark"}
            onClick={() => handleUpgrade(props.price.name, props.cycle)}
          />
        </div>
      )}
    </div>
  );
}

export default function PricingPage() {
  const router = useRouter();

  const [paymentCycle, setPaymentCycle] = useState<PaymentCycleType>("monthly");

  const handlePaymentCycle = (cycle: PaymentCycleType) => {
    setPaymentCycle(cycle);
  };

  return (
    <>
      <div className={styles["window-header"]}>
        <div className={styles["window-header-title"]}>
          <div className={styles["window-header-main-title"]}>定价</div>
          <div className={styles["window-header-sub-title"]}>解锁更多权益</div>
        </div>
        <div className={styles["window-actions"]}>
          <div className={styles["window-action-button"]}>
            <IconButton
              icon={<CloseIcon />}
              onClick={() => router.push("/")}
              bordered
              title={Locale.Settings.Actions.Close}
            />
          </div>
        </div>
      </div>

      <div className={styles.switch}>
        <button
          className={`${styles.button} ${
            paymentCycle === "monthly" ? styles.active : ""
          }`}
          onClick={() => handlePaymentCycle("monthly")}
        >
          月付
        </button>
        <button
          className={`${styles.button} ${styles["button-with-badge"]} ${
            paymentCycle === "quarterly" ? styles.active : ""
          }`}
          onClick={() => handlePaymentCycle("quarterly")}
        >
          季付
          <span className={styles["discount-badge"]}>八五折</span>
        </button>
        <button
          className={`${styles.button} ${styles["button-with-badge"]} ${
            paymentCycle === "yearly" ? styles.active : ""
          }`}
          onClick={() => handlePaymentCycle("yearly")}
        >
          年付
          <span className={styles["discount-badge"]}>七折</span>
        </button>
      </div>

      <div className={styles["container"]}>
        {prices.map((price, index) => (
          <PricingItem
            key={index}
            router={router}
            cycle={paymentCycle}
            price={price}
          />
        ))}
      </div>
    </>
  );
}
