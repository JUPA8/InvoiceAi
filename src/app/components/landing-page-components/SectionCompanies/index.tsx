import Image from "next/image";
import { GridContainer } from "../GridContainer";

export function Companies() {
    return (
        <section >
            <GridContainer className="pt-20 xl:pt-24">
                <div className="grid grid-cols-2 md:grid-cols-3 xl:flex xl:flex-row items-center justify-between gap-y-4 gap-x-10 xl:gap-y-0 xl:gap-x-0 justify-items-center">
                    <Image src="/google.svg" width={146} height={48} alt="google" />
                    <Image src="/microsoft.svg" width={146} height={48} alt="microsoft" />
                    <Image src="/stripe.svg" width={146} height={48} alt="stripe" />
                    <Image src="/oracle.svg" width={146} height={48} alt="oracle" />
                    <Image src="/salesforce.svg" width={146} height={48} alt="salesforce" />
                    <Image src="/amazon.svg" width={146} height={48} alt="amazon" />
                </div>
            </GridContainer>
        </section>
    )
}