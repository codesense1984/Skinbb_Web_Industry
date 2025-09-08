import { Button } from "@/core/components/ui/button";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { Link } from "react-router";

const Thankyou = () => {
  return (
    <div className="space-y-4 py-10">
      <h3>Thank You for Submitting Your Company Profile!</h3>

      <p>
        Your details have been successfully submitted for review. Our admin team
        will verify the information and get back to you shortly.
      </p>

      <h4>✅ What happens next?</h4>
      <ul className="text-muted-foreground list-inside list-disc">
        <li>Your profile is currently under review.</li>
        <li>
          You will be notified once it’s approved or if any changes are
          required.
        </li>
      </ul>

      <p>
        If you have any questions in the meantime, feel free to reach out to us
        at connect@skinbb.com.
      </p>

      <div className="flex gap-4 pt-4">
        <Button size={"lg"} color={"secondary"} asChild>
          <Link to={PANEL_ROUTES.ONBOARD.COMPANY} replace>
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Thankyou;
