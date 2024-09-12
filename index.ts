import * as k8s from "@pulumi/kubernetes";

const provider = new k8s.Provider("k8s", {
    enableServerSideApply: true,
    enableConfigMapMutable: true,
});

const ns = new k8s.core.v1.Namespace("production", undefined, {provider});

const appLabels = {app: "nginx"};
const deployment = new k8s.apps.v1.Deployment("nginx", {
    metadata: {
        namespace: ns.metadata.name,
    },
    spec: {
        selector: {matchLabels: appLabels},
        replicas: 1,
        template: {
            metadata: {
                labels: appLabels,
            },
            spec: {
                containers: [
                    {
                        name: "nginx",
                        image: "nginx",
                        ports: [{containerPort: 80}],
                    },
                ],
            }
        }
    }
}, {provider});
const service = new k8s.core.v1.Service("nginx", {
    metadata: {
        labels: deployment.spec.selector.matchLabels,
    },
    spec: {
        clusterIP: "None",
        ports: [{
            name: "web",
            port: 80,
        }],
        selector: deployment.spec.selector.matchLabels,
    },
}, {provider});
