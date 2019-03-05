package gov.nasa.jpl.mpsa.cli.models;

public class Constraint {
    public String name;
    public String type;

    public Constraint() {}

    public Constraint(String name, String type) {
        this.name = name;
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
