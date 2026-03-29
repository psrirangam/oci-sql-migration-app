export default function Footer() {
  return (
    <footer className="border-t border-border bg-background py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <p>
            Designed and Built by{" "}
            <a
              href="mailto:pavan.srirangam@oracle.com"
              className="font-semibold text-foreground hover:underline"
            >
              Pavan Srirangam
            </a>
            {" "}for Oracle Sales Engineering
          </p>
          <p>
            For feature requests or to report issues, please contact{" "}
            <a
              href="mailto:pavan.srirangam@oracle.com"
              className="font-semibold text-foreground hover:underline"
            >
              pavan.srirangam@oracle.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
