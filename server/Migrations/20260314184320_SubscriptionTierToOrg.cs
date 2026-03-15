using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DiffDetector.Api.Migrations
{
    /// <inheritdoc />
    public partial class SubscriptionTierToOrg : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSubscriptionActive",
                table: "Organizations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "SubscriptionPlan",
                table: "Organizations",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsSubscriptionActive",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "SubscriptionPlan",
                table: "Organizations");
        }
    }
}
