import {Html, Body, Container, Head, Heading, Preview, Section, Text} from "@react-email/components";
import * as React from "react";

export default function EmailTemplate({
  userName = "",
  type = "budget-alert",
  data = {},
}) {
  if (type === "budget-alert") {
    return (
      <Html>
        <Head />
        <Preview>🔔 Budget Alert — Vault AI</Preview>

        <Body style={styles.body}>
          <Container style={styles.container}>
            {/* HEADER */}
            <Section style={styles.header}>
              <Heading style={styles.title}>💰 Budget Alert</Heading>
            </Section>

            {/* CONTENT */}
            <Section style={styles.content}>
              <Text style={styles.greeting}>Hi {userName}! 👋</Text>

              <Text style={styles.message}>
                You’ve used{" "}
                <span style={styles.highlight}>
                  {data?.percentageUsed?.toFixed(1)}%
                </span>{" "}
                of your monthly budget.
              </Text>

              {/* STATS BOX */}
              <Section style={styles.statsContainer}>
                <div style={styles.stat}>
                  <Text style={styles.statLabel}>Budget Amount</Text>
                  <Text style={styles.statValue}>
                    ${data?.budgetAmount?.toFixed(2)}
                  </Text>
                </div>

                <div style={styles.divider}></div>

                <div style={styles.stat}>
                  <Text style={styles.statLabel}>Spent So Far</Text>
                  <Text style={{ ...styles.statValue, color: "#CA1403" }}>
                    ${data?.totalExpenses?.toFixed(2)}
                  </Text>
                </div>

                <div style={styles.divider}></div>

                <div style={styles.stat}>
                  <Text style={styles.statLabel}>Remaining Budget</Text>
                  <Text style={{ ...styles.statValue, color: "#02C951" }}>
                    ${(data?.budgetAmount - data?.totalExpenses)?.toFixed(2)}
                  </Text>
                </div>
              </Section>

              <Text style={styles.footer}>
                ✨ Stay financially smart with <strong>Vault AI</strong>
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  }
}

/* ===============================
   🎨 EMAIL THEME COLORS MATCHING YOUR WEBSITE
   =============================== */

const styles = {
  body: {
    backgroundColor: "#f8fafc",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    margin: 0,
    padding: "20px 0",
  },

  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    maxWidth: "600px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 8px 24px rgba(147, 51, 234, 0.10)", // purple glow
    overflow: "hidden",
  },

  /* Purple Header (Your Brand Color) */
  header: {
    background: "linear-gradient(135deg, #9333EA 0%, #7e22ce 100%)",
    padding: "40px 20px",
    textAlign: "center",
  },

  title: {
    color: "#ffffff",
    fontSize: "30px",
    fontWeight: "800",
    margin: 0,
    letterSpacing: "-0.5px",
  },

  content: {
    padding: "40px 32px",
  },

  greeting: {
    color: "#1e293b",
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "12px",
  },

  message: {
    color: "#475569",
    fontSize: "16px",
    lineHeight: "1.7",
    marginBottom: "32px",
  },

  highlight: {
    color: "#9333EA",
    fontWeight: "700",
    fontSize: "18px",
  },

  /* Stats Box */
  statsContainer: {
    margin: "30px 0",
    padding: "20px",
    background: "#f7f2ff",
    borderRadius: "12px",
    border: "1px solid #e9d5ff",
  },

  stat: {
    textAlign: "center",
    padding: "8px 0",
  },

  divider: {
    height: "1px",
    backgroundColor: "#e2e8f0",
    margin: "20px 0",
  },

  statLabel: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "700",
    marginBottom: "6px",
  },

  statValue: {
    color: "#1e293b",
    fontSize: "26px",
    fontWeight: "800",
  },

  footer: {
    color: "#64748b",
    fontSize: "14px",
    textAlign: "center",
    marginTop: "30px",
    paddingTop: "20px",
    borderTop: "1px solid #e2e8f0",
  },
};
